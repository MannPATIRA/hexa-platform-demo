/* global Office */

var STATE_KEY = "hexa-state";
var CONFIRM_TIMEOUT_MS = 60000;

Office.onReady(function () {
  Office.actions.associate("openHexaDialog", function (event) {
    var item = Office.context.mailbox.item;
    var baseUrl =
      window.location.protocol + "//" + window.location.host;

    function showNotification(message, persistent) {
      try {
        item.notificationMessages.replaceAsync("hexa-status", {
          type: Office.MailboxEnums.ItemNotificationMessageType
            .InformationalMessage,
          message: message,
          icon: "Icon16",
          persistent: !!persistent,
        });
      } catch (e) {
        // Notification API unavailable
      }
    }

    function clearNotification() {
      try {
        item.notificationMessages.removeAsync("hexa-status");
      } catch (e) {
        // Ignore
      }
    }

    function getState() {
      try {
        var raw = localStorage.getItem(STATE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        // Corrupted
      }
      return null;
    }

    function setState(obj) {
      localStorage.setItem(STATE_KEY, JSON.stringify(obj));
    }

    function clearState() {
      localStorage.removeItem(STATE_KEY);
    }

    var state = getState();

    // State 3: "sent" — open the order in platform and reset
    if (state && state.status === "sent" && state.orderUrl) {
      try {
        window.open(state.orderUrl, "_blank");
      } catch (e) {
        // Popup may be blocked
      }
      clearState();
      clearNotification();
      event.completed();
      return;
    }

    // State 2: "confirming" within timeout — send to API
    if (
      state &&
      state.status === "confirming" &&
      Date.now() - state.ts < CONFIRM_TIMEOUT_MS
    ) {
      var payload = {
        senderName: "",
        senderEmail: "",
        subject: "",
        attachments: [],
      };

      try {
        payload.senderName = item.from.displayName || "";
        payload.senderEmail = item.from.emailAddress || "";
        payload.subject = item.subject || "";
      } catch (e) {
        // Proceed with empty sender/subject
      }

      function sendToApi() {
        showNotification("Sending to Hexa...", true);

        var email = payload.senderEmail;
        var body = JSON.stringify({
          senderName: payload.senderName,
          senderEmail: email,
          emailSubject: payload.subject,
          customer: {
            id: "cust-" + Date.now(),
            name: payload.senderName || "Unknown Sender",
            email: email || "unknown@example.com",
            phone: "",
            company: email
              ? email.split("@")[1].split(".")[0] || "Unknown"
              : "Unknown",
            billingAddress: "Not provided",
            shippingAddress: "Not provided",
          },
          attachments: payload.attachments.map(function (a) {
            var att = {
              id: "att-" + Date.now() + "-" + a.id.slice(-6),
              fileName: a.name,
              mimeType: a.contentType,
              size: a.size,
              url: "/attachment-placeholder",
            };
            if (a.content) att.content = a.content;
            return att;
          }),
        });

        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseUrl + "/api/orders", true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            var order;
            try {
              order = JSON.parse(xhr.responseText);
            } catch (e) {
              // Parse failed
            }

            if (order && order.id) {
              var orderUrl = baseUrl + "/orders/" + order.id;
              setState({ status: "sent", orderUrl: orderUrl });
              showNotification(
                "Sent to Hexa! Click 'Send to Hexa' to view order.",
                true
              );
            } else {
              clearState();
              showNotification("Sent to Hexa!", true);
            }
          } else {
            clearState();
            showNotification("Failed to send — please try again.", false);
          }
          event.completed();
        };

        xhr.onerror = function () {
          clearState();
          showNotification("Network error — please try again.", false);
          event.completed();
        };

        xhr.send(body);
      }

      try {
        if (typeof item.getAttachmentsAsync !== "function") {
          sendToApi();
          return;
        }

        item.getAttachmentsAsync(function (result) {
          if (!result.value || result.value.length === 0) {
            sendToApi();
            return;
          }

          var files = result.value.filter(function (a) {
            return (
              a.contentType.startsWith("image/") ||
              a.contentType === "application/pdf"
            );
          });

          if (files.length === 0) {
            sendToApi();
            return;
          }

          var remaining = files.length;
          files.forEach(function (file) {
            var att = {
              id: file.id,
              name: file.name,
              size: file.size,
              contentType: file.contentType,
            };

            try {
              item.getAttachmentContentAsync(
                file.id,
                function (contentResult) {
                  if (
                    contentResult.status === "succeeded" &&
                    contentResult.value &&
                    contentResult.value.content
                  ) {
                    att.content = contentResult.value.content;
                  }
                  payload.attachments.push(att);
                  remaining--;
                  if (remaining === 0) sendToApi();
                }
              );
            } catch (e) {
              payload.attachments.push(att);
              remaining--;
              if (remaining === 0) sendToApi();
            }
          });
        });
      } catch (e) {
        sendToApi();
      }

      return;
    }

    // State 1: idle / expired — show confirmation prompt
    setState({ status: "confirming", ts: Date.now() });
    showNotification(
      "Send to Hexa? Click 'Send to Hexa' again to confirm.",
      true
    );
    event.completed();
  });
});
