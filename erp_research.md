# Granting third-party API access to SAP, NetSuite, and Dynamics 365

**Connecting a B2B procurement platform to a customer's ERP requires navigating each system's unique security model, authentication framework, and administrative workflow.** The setup complexity varies dramatically: SAP S/4HANA on-premise demands the deepest technical expertise with transaction codes, authorization objects, and CSRF token handling; Oracle NetSuite offers the most streamlined path through its web-based admin console but hides critical gotchas around token-based authentication; and Microsoft Dynamics 365 F&O introduces a dual-admin challenge spanning both Azure AD and the D365 environment. This guide walks through every screen, field, and button click for each system — designed to power an in-app setup wizard that transforms a multi-week enterprise project into a guided, predictable process.

---

# Part 1: SAP S/4HANA (on-premise and cloud)

## A. Roles, responsibilities, and approvals

### Who performs the setup

| Role | Responsibility |
|---|---|
| **SAP Basis Administrator** | Creates RFC destinations (SM59), activates ICF/OData services (/IWFND/MAINT_SERVICE, /SICF), manages SAP Gateway, configures SAP Cloud Connector for cloud scenarios |
| **SAP Security Administrator** | Creates the technical user (SU01), builds the PFCG authorization role, assigns roles, reviews segregation of duties |
| **SAP Functional Consultant (MM/SD)** | Defines scope of data access — which plants, sales orgs, purchasing orgs, document types — and validates API behavior |
| **Network/Infrastructure Team** | Opens firewall rules, configures reverse proxy or SAP Web Dispatcher, manages TLS/SSL certificates |
| **SAP GRC/Compliance Team** | Reviews role design for SoD conflicts, approves critical authorizations via access risk analysis |

The person creating the user and role needs authorization objects **S_USER_GRP** (ACTVT 01/02/03 for user group management), **S_USER_PRO** (profile assignment), and **S_USER_AGR** (role assignment). For SM59/SICF configuration, the Basis admin needs **S_RFC_ADM**, **S_ICF_ADM**, and **S_ADMI_FCD**. **SAP_ALL should never be used in production** — purpose-built admin roles are required.

Large manufacturers and distributors typically require a formal **ITSM change request** before any integration work begins. The approval chain includes: security team (role design review), network security (firewall rules and TLS configuration), data privacy/compliance (GDPR exposure review), business process owner (functional scope approval), and Basis team lead (infrastructure changes). Expect **1–4 weeks** for approvals alone at enterprise-scale organizations.

## B. Step-by-step technical setup

### B1. Creating a dedicated integration user (SU01)

**Navigation:** Enter `/nSU01` in the SAP GUI command field → Enter the user ID → Click **Create**.

**Naming convention:** Use a prefix like `RFC_`, `SVC_`, or `API_` followed by a descriptive identifier — e.g., `SVC_PROCUREMENT_API` or `RFC_B2B_PROCURE`. This makes the user instantly identifiable in logs and audits.

**Tab-by-tab configuration:**

| Tab | Field | Value |
|---|---|---|
| **Address** | Last Name (required) | `B2B Procurement API User` (in S/4HANA 1909+, use the "Create Technical User" button which skips Address data) |
| **Logon Data** | User Type | **System (Type B)** — see rationale below |
| **Logon Data** | Initial Password | Strong password (will be used in RFC destination or API authentication) |
| **Logon Data** | Validity: Start/End | Start = go-live date; End = per security policy or `12/31/9999` for permanent |
| **Defaults** | Language / Date / Decimal | EN, appropriate formats for your locale |
| **Roles** | Role assignment | The PFCG role created in step B2 |
| **Profiles** | Auto-populated | Profiles appear after role assignment and user comparison — **never assign SAP_ALL or SAP_NEW** |

**Why System User (Type B) is the correct choice for API integrations:**

| User Type | Password Expires? | Locked After Failed Logons? | Dialog Logon? | Recommended for API? |
|---|---|---|---|---|
| Dialog (A) | Yes | Yes | Yes | ❌ Causes integration outages |
| **System (B)** | **No** | **No** | **No** | **✅ Best choice** |
| Communication (C) | Yes | Yes | No | ⚠️ Only if policy mandates password expiration |
| Service (S) | No | No | Only anonymous | ❌ Only for anonymous mass access |
| Reference (L) | N/A | N/A | No | ❌ Cannot log on |

**System User (Type B)** is the standard for B2B API/RFC/OData integrations because passwords do not expire (avoiding integration breakage), the account is not locked after failed logon attempts (avoiding production outages), and dialog logon is blocked (preventing interactive misuse).

> **Common mistakes:** Using Dialog (Type A) which causes password expiration and lockout; assigning SAP_ALL; not following naming conventions; sharing credentials across multiple integration partners; forgetting to set validity dates.

### B2. Creating and assigning the authorization role (PFCG)

**Navigation:** Enter `/nPFCG` → Enter role name (e.g., `Z_B2B_PROCUREMENT_API`) → Click **Single Role** → Enter description → **Save**.

Custom role names must start with `Z` or `Y` (never `SAP` or `/`, which are reserved for SAP standard roles).

**Step 1 — Define the Menu tab:**
For API-only integrations, add the OData services to the menu via **Authorization Default → TADIR Service → IWSV** (individual services) or **IWSG** (service groups). This auto-proposes the S_SERVICE authorization object.

**Step 2 — Maintain Authorization Data:**
Go to the **Authorizations** tab → Click **Change Authorization Data**. The system proposes objects based on menu entries, but many critical objects for API integrations need **manual insertion** via Edit → Insert Authorization(s) → Manual Input.

#### Complete authorization object reference

**Infrastructure/connectivity objects (required for all API integrations):**

| Auth Object | Description | Fields | Values |
|---|---|---|---|
| **S_RFC** | RFC access control | RFC_TYPE=`FUGR`; RFC_NAME=specific function groups (use ST01 trace to identify); ACTVT=`16` (Execute) | Restrict RFC_NAME to only the function groups called by the integration — **never use wildcard** |
| **S_SERVICE** | OData/Gateway service access | SRV_NAME=specific OData service technical names; SRV_TYPE=`HT` | Add each activated OData service name |
| **S_ICF** | ICF service authorization | ICF_FIELD=`SERVICE`; ICF_VALUE=authorization string from SICF service node | Match the value configured in the ICF service properties |

**Material master data (read access):**

| Auth Object | Description | Key Fields | Read-Only Values |
|---|---|---|---|
| **M_MATE_WRK** | Plant-level access | ACTVT=`03`; WERKS=specific plant codes | Restrict to relevant plants |
| **M_MATE_MAR** | Material type access | ACTVT=`03`; MTART=specific types (FERT, HAWA, ROH) or `*`; BEGRU=`*` | Use specific material types when possible |
| **M_MATE_STA** | Maintenance status | ACTVT=`03`; STATM=`*` | |
| **M_MATE_MAN** | Client-level data | ACTVT=`03` | |
| **M_MATE_VKO** | Sales org/dist channel | ACTVT=`03`; VKORG=specific; VTWEG=specific | Restrict to relevant sales areas |
| **M_MATE_BUK** | Company code | ACTVT=`03`; BUKRS=specific company codes | |
| **M_MATE_WGR** | Material groups | ACTVT=`03`; MATKL=`*` | |

**Sales orders (create/read/change):**

| Auth Object | Description | Key Fields | Read/Write Values |
|---|---|---|---|
| **V_VBAK_VKO** | Sales area authorization | ACTVT=`01,02,03`; VKORG=specific sales org; VTWEG=specific dist channel; SPART=specific division | ACTVT 01=Create, 02=Change, 03=Display. For read-only, use 03 only |
| **V_VBAK_AAT** | Document type authorization | ACTVT=`01,02,03`; AUART=specific order types (OR, SO, ZOR) | Restrict to only the order types the integration handles |

**Inventory and stock levels (read access):**

| Auth Object | Description | Key Fields | Read-Only Values |
|---|---|---|---|
| **M_MSEG_WMB** | Plant-level goods movements | ACTVT=`03`; WERKS=specific plants | |
| **M_MSEG_BWA** | Movement type access | ACTVT=`03`; BWART=`*` or specific movement types | |
| **M_MSEG_LGO** | Storage location access | ACTVT=`03`; WERKS=specific; LGORT=specific or `*` | Controls storage-location-level stock visibility |

**Purchase orders (create/read/change):**

| Auth Object | Description | Key Fields | Read/Write Values |
|---|---|---|---|
| **M_BEST_BSA** | PO document type | ACTVT=`01,02,03`; BSART=specific PO types (NB=standard, UB=STO) | All four M_BEST_* objects are checked during PO creation |
| **M_BEST_EKO** | Purchasing organization | ACTVT=`01,02,03`; EKORG=specific purchasing orgs | |
| **M_BEST_EKG** | Purchasing group | ACTVT=`01,02,03`; EKGRP=specific groups or `*` | |
| **M_BEST_WRK** | Receiving plant | ACTVT=`01,02,03`; WERKS=specific plants | Checks the receiving plant on PO line items |

**Customer master data (read access):**

| Auth Object | Description | Key Fields | Read-Only Values |
|---|---|---|---|
| **F_KNA1_BUK** | Company code authorization | ACTVT=`03`; BUKRS=specific company codes | |
| **F_KNA1_GRP** | Account group | ACTVT=`03`; KTOKD=specific account groups or `*` | |
| **F_KNA1_APP** | Application area | ACTVT=`03`; APPKZ=`V` (Sales) or `*` | |
| **B_BUPA_GRP** | Business Partner grouping (S/4HANA) | ACTVT=`03`; BU_GROUP=specific | Required in S/4HANA where customer master is managed via Business Partner |

**Pricing and conditions (read access):**

| Auth Object | Description | Key Fields | Read-Only Values |
|---|---|---|---|
| **V_KONH_VKO** | Sales org for conditions | ACTVT=`03`; VKORG, VTWEG, SPART=specific | |
| **V_KONH_VKS** | Condition type | ACTVT=`03`; KSCHL=specific condition types (PR00, K004) or `*` | |

**Step 3 — Set field values:** Expand each authorization object in the tree, click the pencil icon for each field, enter values, and confirm with the green checkmark. Traffic lights indicate status: 🟢 = fully maintained, 🟡 = needs values, 🔴 = organizational levels missing.

**Step 4 — Generate the authorization profile:** Click **Save**, then click **Generate** (or Utilities → Generate). Enter a profile name (max 12 characters) and description. **This step is critical — without profile generation, the authorizations do not take effect.** This is the single most common mistake in PFCG role building.

**Step 5 — Assign the role to the user:** Go to the **User** tab → Enter the technical user ID → Set validity dates → Click **Save** → Click **User Comparison** → Select **Complete Comparison** → Execute. This writes the profile to the user master record.

> **Debugging approach:** After initial setup, test the API call. If an authorization error occurs, run **SU53** for the technical user to see the last failed authorization check (exact object, fields, required values). Use **ST01** or **STAUTHTRACE** to trace all authorization checks during an API call. Iteratively add missing objects until all checks pass.

### B3. Setting up RFC destination (SM59) — outbound only

RFC destinations in SM59 are for **outbound** connections from SAP to external systems. For **inbound** API access (the B2B platform calling into SAP), no SM59 destination is needed — the platform authenticates directly via HTTP(S) against activated ICF/OData services.

**If the integration requires SAP to push data outbound** to the B2B platform:

**Navigation:** Enter `/nSM59` → Click **Create**.

| Field | Value |
|---|---|
| RFC Destination | `B2B_PLATFORM_OUTBOUND` |
| Connection Type | **Type G** (HTTP Connection to External Server) |
| Description | `Outbound connection to B2B procurement platform` |

**Technical Settings tab:**

| Field | Value |
|---|---|
| Target Host | `api.b2bplatform.com` (FQDN) |
| Service No. | `443` (for HTTPS) |
| Path Prefix | `/api/v2/` (base API path) |

**Logon & Security tab:** Enable **SSL Active**, select the appropriate SSL certificate from the PSE store (managed via `STRUST`). Configure Basic Authentication with username/password or client certificate authentication.

**Testing:** Select the destination → Utilities → Test → **Connection Test**. A successful test shows a response time table with the message **"Connection test successful"** in green.

### B4. Enabling OData services (on-premise S/4HANA)

**Navigation:** Enter `/n/IWFND/MAINT_SERVICE`.

**Step-by-step activation:**

1. Click **Add Service**
2. In System Alias field, enter `LOCAL` (for S/4HANA embedded gateway — the standard deployment)
3. Click **Get Services** to load all available services
4. Filter for the desired service name and check its checkbox
5. Click **Add Selected Services**
6. Assign a package (`$TMP` for testing, or a transportable package for production)
7. Click **Continue** and save

**Key OData services for procurement integration:**

| Service Name | Purpose | Key Entities |
|---|---|---|
| **API_PURCHASEORDER_PROCESS_SRV** | Purchase Order CRUD | A_PurchaseOrder, A_PurchaseOrderItem |
| **API_SALES_ORDER_SRV** | Sales Order processing | A_SalesOrder, A_SalesOrderItem |
| **API_PRODUCT_SRV** | Material/Product master (read) | A_Product, A_ProductPlant, A_ProductDescription |
| **API_BUSINESS_PARTNER** | Customer/Vendor master data | A_BusinessPartner, A_BusinessPartnerAddress |
| **API_MATERIAL_STOCK_SRV** | Inventory by plant/storage location | A_MatlStkInAcctMod |
| **API_SLSPRICINGCONDITIONRECORD_SRV** | Pricing conditions | A_SlsPrcgCndnRecdValidity |
| **API_PURCHASEREQ_PROCESS_SRV** | Purchase Requisitions | A_PurchaseRequisition, A_PurchaseRequisitionItem |

**ICF prerequisite:** These OData services require ICF nodes to be active. Verify in transaction `/SICF` that the nodes `/sap/opu/`, `/sap/opu/odata/`, and `/sap/opu/odata/sap/` are all active. Right-click → **Activate Service** if any show "Inactive."

**Browser testing URL pattern:**
```
https://<host>:<port>/sap/opu/odata/sap/<SERVICE_NAME>/$metadata
```
Example:
```
https://s4hana.company.com:44300/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/$metadata
```

The `$metadata` endpoint returns the EDMX schema. For data queries, use:
```
/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=10&$format=json
```

SAP also provides an in-GUI test tool at transaction `/IWFND/GW_CLIENT`.

### B5. S/4HANA Cloud setup (Communication Arrangements)

S/4HANA Cloud (Public Edition) does not expose traditional SAP GUI transactions. All integration is configured through the **Fiori Launchpad** under Communication Management.

**Step 1 — Create Communication User** (app: "Maintain Communication Users"):
Click **New** → Enter username (e.g., `B2B_PLATFORM_API`) and description → Set authentication method (Basic Auth with password, or upload X.509 certificate for certificate-based auth) → **Save**.

**Step 2 — Create Communication System** (app: "Communication Systems"):
Click **New** → Enter System ID and System Name (e.g., `B2B_PROCUREMENT_PLATFORM`) → Under Technical Data: Host Name = `api.b2bplatform.com`, Port = `443` → Under Users for Inbound Communication: add the Communication User from Step 1 → **Save**.

**Step 3 — Create Communication Arrangement** (app: "Communication Arrangements"):
Click **New** → Select the **Communication Scenario** → Enter arrangement name → Click **Create** → Select Communication System → Verify inbound user and authentication → Copy the generated **service URLs** from the Inbound Services section → **Save**.

**Key Communication Scenarios for procurement:**

| Scenario ID | Name | APIs Included |
|---|---|---|
| **SAP_COM_0053** | Purchase Order Integration | Purchase Order OData API |
| **SAP_COM_0009** | Purchase Requisition Integration | Purchase Requisition API |
| **SAP_COM_0008** | Business Partner Integration | Business Partner OData & SOAP |
| **SAP_COM_0028** | Product Integration | Product/Material Master API |
| **SAP_COM_0057** | Supplier Invoice Integration | Supplier Invoice APIs |
| **SAP_COM_0108** | Material Document Integration | Goods Receipt/Material Doc APIs |

OAuth 2.0 is supported: in the Communication Arrangement, the **Inbound Communication** section shows OAuth 2.0 Details including the Client ID. The external system authenticates via the SAP OAuth token endpoint and uses the bearer token for API calls. All available APIs can be explored at **https://api.sap.com** filtered by product "SAP S/4HANA Cloud."

### B6. Testing the connection

**Postman test — read operation (with CSRF token fetch):**
```
GET https://<host>:<port>/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder?$top=5&$format=json
Headers:
  Authorization: Basic <base64(user:password)>
  X-CSRF-Token: Fetch
```
**Expected:** HTTP **200 OK** with JSON purchase order data. Response headers include `X-CSRF-Token: <token_value>` and `Set-Cookie` headers.

**Postman test — write operation:**
```
POST https://<host>:<port>/sap/opu/odata/sap/API_PURCHASEORDER_PROCESS_SRV/A_PurchaseOrder
Headers:
  Authorization: Basic <base64(user:password)>
  X-CSRF-Token: <token_value_from_GET>
  Cookie: <all_cookies_from_GET_response>
  Content-Type: application/json
Body: { ...purchase order JSON payload... }
```
**Expected:** HTTP **201 Created**.

**CSRF token handling is critical for all write operations.** Fetch the token via a GET request with `X-CSRF-Token: Fetch` header, then include both the token and all session cookies in subsequent POST/PUT/PATCH/DELETE requests. If the token expires, the server responds with `403 Forbidden` and header `X-CSRF-Token: Required`.

**Common error codes and their meanings:**

| Code | Meaning | Typical Cause |
|---|---|---|
| **200/201** | Success | — |
| **401** | Unauthorized | Wrong credentials, locked user, expired password |
| **403** | Forbidden | Missing CSRF token, or user lacks authorization objects (check SU53) |
| **404** | Not Found | Service not activated in /IWFND/MAINT_SERVICE, ICF node inactive, wrong URL path |
| **405** | Method Not Allowed | CSRF token missing on write operation |
| **500** | Internal Server Error | ABAP runtime error — check ST22 for dumps |

**Diagnostic transactions:** `/IWFND/ERROR_LOG` for Gateway errors; **SM21** for system log; **ST22** for ABAP dumps; **STAD** for request statistics; **SU53** for the last failed authorization check.

## C. Verification checklist for SAP

- [ ] Technical user created in SU01 as Type B (System)
- [ ] PFCG role created with all required authorization objects (infrastructure + business)
- [ ] **Profile generated** in PFCG (most commonly forgotten step)
- [ ] User comparison completed (role assigned → profile written to user master)
- [ ] OData services activated in /IWFND/MAINT_SERVICE
- [ ] ICF nodes active for `/sap/opu/odata/sap/`
- [ ] GET request to `$metadata` endpoint returns HTTP 200 with EDMX schema
- [ ] GET request to entity set (e.g., `A_PurchaseOrder?$top=1`) returns data
- [ ] POST request with CSRF token creates a test record (201 response)
- [ ] SU53 shows no failed authorization checks for the technical user
- [ ] Security Audit Log filter configured in SM19 for the technical user
- [ ] Firewall rules allow HTTPS traffic from the B2B platform's IP range

## D. SAP security best practices

**Least privilege:** For read-only inventory sync, set all ACTVT fields to `03` (Display) only. For bidirectional order sync, add ACTVT `01` (Create) and `02` (Change) on the order-related objects (V_VBAK_*, M_BEST_*) while keeping master data objects at `03`.

**IP whitelisting:** On-premise, configure via SAP Web Dispatcher (recommended as reverse proxy in DMZ) or OS-level firewall rules. S/4HANA Cloud does not support IP whitelisting for API traffic — SAP recommends **mTLS/X.509 client certificates** instead.

**Credential rotation:** For System Users (Type B), passwords do not expire by design. Implement a manual rotation schedule of **90 days minimum**. For S/4HANA Cloud, rotate Communication User credentials via the Maintain Communication Users app. For certificate-based auth, track expiration dates and renew before expiry via `STRUST` (on-premise) or the Communication User app (cloud).

**Audit logging:** Configure Security Audit Log in **SM19/RSAU_CONFIG** with a filter for the technical API user logging all RFC/HTTP logon attempts and transaction executions. Read logs in **SM20/RSAU_READ_LOG**. Use **STAD** for per-request performance data including response times and HTTP status codes.

## E. Visual documentation guidance for SAP

| Screen | Transaction | Key Fields to Highlight |
|---|---|---|
| User creation | SU01 | User Type dropdown (Logon Data tab), Roles tab assignment area |
| Role maintenance | PFCG | Authorization objects tree with traffic lights, Generate button, User tab with comparison |
| RFC destination | SM59 | Connection type dropdown, Technical Settings (host/port/path), Logon & Security tab |
| OData service catalog | /IWFND/MAINT_SERVICE | Add Service button, System Alias field, service list with activation status |
| ICF service tree | /SICF | Service node activation status (green = active, red = inactive) |
| Error log | /IWFND/ERROR_LOG | Date/user/status code filters, error detail panel |
| Communication Arrangement (Cloud) | Fiori Launchpad | Scenario selection, Communication System dropdown, Inbound Services URLs |

**Correct final states:** RFC connection test shows **green status with "Connection test successful"**. OData `$metadata` call returns **HTTP 200 with XML schema**. PFCG role shows **all green traffic lights** on authorization objects. /IWFND/MAINT_SERVICE shows the service with **"Active" status** and a green icon.

## F. SAP timeline and complexity

| Scenario | Best Case | Typical | Worst Case |
|---|---|---|---|
| On-premise, experienced team | 2–3 days | 1–2 weeks | 4–6 weeks |
| On-premise, first-timer with enterprise approvals | 2–3 weeks | 4–8 weeks | 3+ months |
| Cloud (Public Edition), experienced team | 1 day | 2–5 days | 1–2 weeks |
| Cloud, first-timer | 3–5 days | 1–3 weeks | 4–6 weeks |

**Common blockers:** Basis team availability (shared teams may have multi-day queues); security/compliance approval cycles (1–4 weeks); SSL certificate procurement from enterprise CA (days to weeks); firewall rule changes requiring network team involvement; transport process from DEV → QAS → PRD adding 1–3 days per stage.

**What the platform can pre-generate:** Exact list of Communication Scenarios needed; Postman collections with all required API calls and CSRF handling; configuration guides customized for the customer's S/4HANA version; the platform's public certificate for upload to SAP; a complete authorization object specification so the security admin can build the PFCG role without guesswork.

---

# Part 2: Oracle NetSuite

## A. Roles, responsibilities, and approvals

The primary performer is the **NetSuite Administrator** (titled "NetSuite Admin," "ERP Administrator," or "IT Systems Administrator"). This person **must have the Administrator role** in NetSuite — or at minimum a custom role with Core Administration Permissions (CAP) and the Enable Features permission. Only users with the Administrator or Full Access role can enable SuiteCloud features, create integration records, and manage credentials.

Typical approvals needed include: IT Security team (review role permissions, approve IP whitelisting), CFO/Controller (approve access to financial transaction data), Compliance/Audit (SOX compliance review, separation of duties), and the NetSuite account owner (may need to authorize additional SuiteCloud Plus licenses for concurrency). At large manufacturers, all changes should be documented in the change management system, tested in Sandbox first, and scheduled around close periods to avoid month-end/quarter-end disruptions.

## B. Step-by-step technical setup

### B1. Enabling Token-Based Authentication

**Navigation:** `Setup > Company > Enable Features > SuiteCloud tab`

Enable these checkboxes in order:

| Section | Checkbox | Required? | Notes |
|---|---|---|---|
| SuiteScript | ☑ Client SuiteScript | Only if using RESTlets | Click "I Agree" on SuiteCloud Terms of Service |
| SuiteScript | ☑ Server SuiteScript | Only if using RESTlets | Required for server-side scripting |
| SuiteTalk (Web Services) | ☑ SOAP Web Services | Yes | Enables SOAP/SuiteTalk API |
| SuiteTalk (Web Services) | **☑ REST Web Services** | **Yes — critical** | **Forgetting this is the #1 cause of "Invalid Login Attempt" errors on REST calls** |
| Manage Authentication | ☑ Token-Based Authentication | Yes | Click "I Agree" on Terms of Service |

> **Most common mistake:** Not enabling **REST Web Services**. This single checkbox is responsible for the majority of cryptic 401 "Invalid Login Attempt" errors reported in NetSuite community forums. The fix is simply checking this box.

### B2. Creating an Integration Record

**Navigation:** `Setup > Integration > Manage Integrations > New`

| Field | Value |
|---|---|
| **Name** | `[VendorName] Procurement Integration` (follow naming convention: `[VendorName] [Purpose] Integration`) |
| **State** | Enabled (default) |

**Authentication tab:**

- ☑ **Token-Based Authentication** — must be checked
- ☐ **TBA: Authorization Flow** — **uncheck** (checked by default; not needed for server-to-server)
- ☐ **Authorization Code Grant** — uncheck
- ☐ **Client Credentials** — uncheck unless using OAuth 2.0 M2M flow

**On save — critical moment:** NetSuite generates a **Consumer Key** and **Consumer Secret**. **These are displayed only once.** After leaving the page, they cannot be retrieved. Copy both values immediately to a secure password manager. If lost, you must reset credentials via Edit > Reset Credentials (which invalidates the old values). **Never send these via email** — use a secure credential sharing tool.

### B3. Creating a dedicated integration role

**Navigation:** `Setup > Users/Roles > Manage Roles > New`

**Create a new custom role from scratch** rather than cloning the Administrator role (which grants excessive permissions).

**Role header configuration:**

| Field | Value |
|---|---|
| **Name** | `[PlatformName] Integration Role` |
| **Center Type** | Classic Center |
| **Subsidiary Restrictions** | **All** (critical for OneWorld accounts with multi-subsidiary access) |
| **Web Services Only Role** | ☑ Check — prevents UI login, restricts to API-only access. **Note:** This is incompatible with RESTlets. Use only if you're using REST API + SOAP exclusively. |

#### Setup tab permissions (critical for authentication)

| Permission Name (exact) | Level | Purpose |
|---|---|---|
| **Log in using Access Tokens** | Full | **Without this, TBA authentication fails entirely.** The most commonly missed permission. |
| **User Access Tokens** | Full | Superset of the above — allows creating/managing tokens AND logging in with them. Include either this OR "Log in using Access Tokens." |
| **SOAP Web Services** | Full | **Must be Full** — any other level blocks web services login |
| **REST Web Services** | Full | Required for REST API access |
| **SuiteScript** | Full | Required only if using RESTlets |
| **Deleted Records** | View | Useful for sync to detect deleted records |

#### Transactions tab permissions

| Permission Name | Read-Only Level | Read/Write Level | Notes |
|---|---|---|---|
| **Sales Order** | View | Full | Full = view, create, edit, delete |
| **Purchase Order** | View | Full | Core for procurement |
| **Invoice** | View | Full | For AR integration |
| **Credit Memo** | View | Full | For returns/credits |
| **Item Fulfillment** | View | Full | Shipping/fulfillment tracking |
| **Item Receipt** | View | Full | Receiving against POs |
| **Vendor Bill** | View | Full | AP/vendor invoicing |
| **Transfer Order** | View | Full | Inter-location transfers |
| **Find Transaction** | View | View | **Required for GET operations** — many admins miss this |

#### Lists tab permissions

| Permission Name | Level | Notes |
|---|---|---|
| **Items** | Full | All item types (inventory, non-inventory, service, assembly, kit) |
| **Customers** | Full | Customer/entity management |
| **Vendors** | Full | Vendor/supplier management |
| **Locations** | View | Warehouse/location data |
| **Subsidiaries** | Full | **Required for OneWorld** — must be Full |
| **Currency** | View | Multi-currency support |
| **Units of Measure** | View | UoM data for items |
| **Price Level / Pricing** | View | Price levels |
| **Accounts** | View | GL account references on transactions |

#### Reports tab permissions

| Permission Name | Level |
|---|---|
| **Financial Reports** | View |
| **Inventory Reports** | View |
| **Sales Reports** | View |
| **Purchase Reports** | View |

### B4. Creating the integration user

**Navigation:** `Lists > Employees > Employees > New`

Create a **dedicated employee record** — never use an existing human user's account. This is essential for tracking and auditing.

| Field | Value |
|---|---|
| First Name | `Integration` or `[PlatformName]` |
| Last Name | `User` or `API` |
| Email | Functional/shared email (e.g., `netsuite-integration@company.com`) |
| Subsidiary | Appropriate subsidiary (or parent for OneWorld) |

On the **Access subtab:** Check ☑ **Give Access** → Set a strong password (required for the account, not used for TBA) → In the Roles section, select the custom integration role from the dropdown → Click **Add** → **Save**.

> **Important:** Use an email on a company-controlled distribution list so access isn't lost if an individual leaves the organization.

### B5. Generating access tokens

**Navigation:** `Setup > Users/Roles > Access Tokens > New`

1. **Application Name:** Select the Integration Record from B2
2. **User:** Select the integration user from B4
3. **Role:** Select the custom integration role from B3
4. Click **Save**

**On save — critical moment:** NetSuite displays a **Token ID** and **Token Secret**. **These are displayed only once.** Copy both immediately. TBA tokens **do not expire automatically** — they remain valid until manually revoked.

A single consumer key/secret can be linked to multiple access tokens, enabling zero-downtime rotation.

### B6. Setting up API endpoints

**Recommended approach for procurement integration: REST API with SuiteQL.**

**REST API base URL:**
```
https://{ACCOUNT_ID}.suitetalk.api.netsuite.com/services/rest/record/v1/{recordType}
```

**Account ID format:** Production uses numeric IDs (e.g., `1234567`). Sandbox uses the format `1234567-sb1` in URLs but `1234567_SB1` (uppercase, underscore) in the OAuth realm parameter. **This mismatch between URL format and realm format is a constant source of errors.**

**Key endpoints:**

| Operation | Method | URL |
|---|---|---|
| List Sales Orders | GET | `/services/rest/record/v1/salesOrder` |
| Get Purchase Order | GET | `/services/rest/record/v1/purchaseOrder/{id}` |
| Create Purchase Order | POST | `/services/rest/record/v1/purchaseOrder` |
| Get Inventory Item | GET | `/services/rest/record/v1/inventoryItem/{id}` |
| Metadata Catalog | GET | `/services/rest/record/v1/metadata-catalog/` |

**SuiteQL** (SQL-like queries via REST — ideal for complex inventory lookups and bulk reads):
```
POST /services/rest/query/v1/suiteql
Content-Type: application/json
Prefer: transient
Body: {"q": "SELECT id, tranid, entity, total FROM transaction WHERE type = 'SalesOrd'"}
```

### B7. Testing

**Postman OAuth 1.0 setup:**

| Setting | Value |
|---|---|
| Auth Type | OAuth 1.0 |
| Signature Method | **HMAC-SHA256** (not HMAC-SHA1 — this matters) |
| Consumer Key | From Integration Record |
| Consumer Secret | From Integration Record |
| Access Token | Token ID from B5 |
| Token Secret | Token Secret from B5 |
| Realm | Account ID (e.g., `1234567` or `1234567_SB1` for sandbox — **uppercase, underscore**) |
| Add auth data to | Request Headers |

**Test request:**
```
GET https://{ACCT}.suitetalk.api.netsuite.com/services/rest/record/v1/salesOrder?limit=5
```
**Expected:** HTTP 200 OK with JSON array of sales orders.

**Common errors:**

| Status | Code | Fix |
|---|---|---|
| **401** | INVALID_LOGIN | Verify all 4 credentials; check realm format; confirm REST Web Services is enabled; check Login Audit Trail |
| **403** | INSUFFICIENT_PERMISSION | Add missing permission to role; check subsidiary restrictions |
| **429** | CONCURRENCY_LIMIT_EXCEEDED | Implement retry with exponential backoff |

> **Troubleshooting "Invalid Login Attempt"** — the most common issue. Check these in order: (1) REST Web Services enabled in SuiteCloud features, (2) realm uses underscore not hyphen for sandbox, (3) TBA feature enabled, (4) role has "Log in using Access Tokens" permission, (5) SOAP Web Services permission is Full on the role, (6) check Login Audit Trail at `Setup > Users/Roles > User Management > View Login Audit Trail`.

## C. Verification checklist for NetSuite

- [ ] All 4 SuiteCloud features enabled (SuiteScript if needed, SOAP WS, REST WS, TBA)
- [ ] Integration record created; Consumer Key/Secret securely stored
- [ ] Custom role has "Log in using Access Tokens" and SOAP/REST Web Services = Full
- [ ] **"Find Transaction" permission** added to role (commonly missed; needed for GET operations)
- [ ] Subsidiary Restrictions set to "All" for OneWorld accounts
- [ ] Dedicated integration user created with role assigned
- [ ] Access Token generated; Token ID/Secret securely stored
- [ ] Account ID noted (from `Setup > Company > Company Information`)
- [ ] Test GET request returns 200 OK with data
- [ ] Test POST request successfully creates a record
- [ ] Sandbox tokens created separately (these are destroyed on every sandbox refresh)

## D. NetSuite security best practices

**Least privilege:** For read-only inventory sync, grant Items = View, Locations = View, and the required Setup permissions for TBA. No transaction permissions needed. For bidirectional order sync, add Sales Order = Full, Purchase Order = Full, Items = Full, Customers = Full, Vendors = Full.

**IP restrictions:** Enable via `Setup > Company > Enable Features > General > Access > IP Address Rules`. On the role, check ☑ "Restrict this role by IP Address." Set rules at `Setup > Company > Company Information > IP Address Rules`. **Caveat from Oracle:** IP addresses are not a reliable second authentication factor — IPv6 is not supported, and SuiteAnalytics Connect does not respect IP rules.

**Token rotation (zero-downtime process):** Create a new access token (same integration record, user, role) → Update the platform with the new Token ID/Secret → Verify it works → Revoke the old token. Multiple tokens can coexist during the transition. Recommended rotation schedule: **every 90 days**.

**Audit logging:** Login Audit Trail at `Setup > Users/Roles > User Management > View Login Audit Trail` shows all authentication attempts with IP addresses. System Notes on every record show API-initiated changes. Web Services Usage Log at `Setup > Integration > Web Services Usage Log` shows SOAP request details. Integration Governance dashboard at `Setup > Integration > Integration Governance` shows real-time concurrency usage.

**Concurrency limits:** Account-wide shared across SOAP + REST + RESTlets. Base limit depends on service tier (e.g., Tier 1 = 15 concurrent requests). Each SuiteCloud Plus license adds 10 concurrent slots. RESTlets: 5 concurrent calls per user. HTTP 429 returned when limits are exceeded.

## E. Visual documentation guidance for NetSuite

| Screen | Navigation | Key Fields to Highlight |
|---|---|---|
| SuiteCloud features | `Setup > Company > Enable Features > SuiteCloud` | SOAP/REST Web Services checkboxes, TBA checkbox |
| New Integration | `Setup > Integration > Manage Integrations > New` | Name, TBA checkbox, Consumer Key/Secret display |
| New Role | `Setup > Users/Roles > Manage Roles > New` | Web Services Only checkbox, Subsidiary Restrictions, Permissions tabs |
| Role permissions | Role > Permissions > Setup tab | "Log in using Access Tokens," "SOAP Web Services," "REST Web Services" rows |
| New Employee | `Lists > Employees > Employees > New` | Access subtab, Give Access checkbox, Role dropdown |
| Access Tokens | `Setup > Users/Roles > Access Tokens > New` | Application Name, User, Role dropdowns, Token ID/Secret display |
| Company Information | `Setup > Company > Company Information` | Account ID field |

**Correct final states:** Enable Features shows all checkboxes checked with terms accepted. Integration Record shows State = Enabled, TBA = checked. Access Token page shows confirmation with Token ID and Token Secret displayed. Test API call returns **HTTP 200 with JSON `{"links":[...], "items":[...]}`** structure.

## F. NetSuite timeline and complexity

| Scenario | Duration |
|---|---|
| Experienced NetSuite admin | **30–60 minutes** for complete setup |
| First-timer with documentation | **2–4 hours** including troubleshooting |
| Enterprise with change management | **1–2 weeks** including approval cycles |

**Common blockers:** User lacks Administrator role (can't enable features or create integrations); forgetting to copy Consumer Key/Secret or Token ID/Secret (displayed only once); REST Web Services not enabled (cryptic "Invalid Login" errors); sandbox refresh invalidating all tokens (must recreate); subsidiary restrictions not set to "All" in OneWorld accounts.

**What the platform can automate:** Provide a pre-built Role XML/SDF template for import; offer a "test connection" button that validates all 4 credentials; pre-fill endpoint URLs based on Account ID; provide a SuiteApp bundle that auto-creates the role and integration record.

---

# Part 3: Microsoft Dynamics 365 Finance & Operations

## A. Roles, responsibilities, and approvals

This setup uniquely requires **two different administrators:**

| Role | System | Responsibility |
|---|---|---|
| **Azure AD Global Administrator** (or Application Administrator) | Azure Portal | Creates App Registration, grants admin consent for API permissions, configures Conditional Access policies |
| **D365 System Administrator** | D365 F&O | Registers the Azure AD app, creates the service account user, assigns security roles, configures throttling |

Not everyone in the organization needs to complete all steps — the Azure AD admin and D365 admin are often different people on different teams, which introduces coordination overhead. At large enterprises, the Azure AD admin sits in the central IT/identity team while the D365 admin sits in the ERP/business applications team. A formal change request coordinating both teams is standard, with additional approvals from the Change Advisory Board (CAB) and data governance/privacy team if PII or financial data is exposed.

## B. Step-by-step technical setup

### B1. Azure AD (Entra ID) App Registration

**Navigation:** `portal.azure.com` → Azure Active Directory → App registrations → **+ New registration**

| Field | Value |
|---|---|
| **Name** | `{VendorName}-D365FO-Integration` or `{VendorName}-ProcurementAutomation-Prod` |
| **Supported account types** | **"Accounts in this organizational directory only (Single tenant)"** — correct for B2B integration where the app lives in the customer's tenant |
| **Redirect URI** | **Leave blank** — not needed for server-to-server client_credentials flow (no interactive sign-in) |

Click **Register**. Note the **Application (client) ID** and **Directory (tenant) ID** from the Overview page.

**Configuring API permissions:**

1. Click **API permissions** in the left menu
2. Click **+ Add a permission**
3. Select the **APIs my organization uses** tab
4. Search for **"Microsoft Dynamics ERP"** (the full name — partial searches may not find it)
5. Select **Delegated permissions** and enable:
   - **AX.FullAccess** — "Access Dynamics AX online as organization users"
   - **CustomService.FullAccess** — "Access Dynamics AX Custom Service"
   - **Odata.FullAccess** — "Access Dynamics AX data"
6. Click **Add permissions**
7. Click **Grant admin consent for {tenant}** — requires Global Admin

**Important nuance:** D365 F&O only exposes Delegated permissions under the Dynamics ERP API — there are no Application permissions. The actual data-level authorization is controlled by **security roles assigned to the mapped user in D365 F&O**, not by these Azure AD permission scopes. For S2S using client_credentials, Microsoft states this API permissions step may not be strictly required, but most consultants add it for completeness.

> **Common mistakes:** Searching for "Dynamics ERP" instead of the full name; selecting the wrong tenant in multi-tenant environments; forgetting to click "Grant admin consent" (permissions show "Not granted" status); using Application permissions instead of Delegated.

### B2. Client secret or certificate

**Navigation:** App registration → Certificates & secrets → **+ New client secret**

| Field | Value |
|---|---|
| Description | `D365FO-Integration-Secret-2026` |
| Expiration | **6 months** (Microsoft's security recommendation — maximum is 24 months; "Never" has been removed) |

Click **Add** → **Copy the Value immediately** — it is shown only once and masked after you leave.

**Certificate vs. secret:** Microsoft **strongly recommends certificates** over secrets for production: "We strongly recommend that you use x509 certificates issued by Trusted Certificate Authority as the only credential type for getting tokens for your application." Certificates use asymmetric cryptography (private key never shared), generate short-lived client assertions, and are harder to leak than static secrets.

**Zero-downtime secret rotation:** D365 supports multiple active secrets simultaneously. Create a new secret → update the integration → verify → delete the old secret. Automate expiration notifications using Power Automate, Azure Logic Apps, or PowerShell.

### B3. Creating the Application User in D365 F&O

**Navigation in D365 F&O:** `System Administration > Setup > Azure Active Directory applications`
**Direct URL:** `https://{env}.operations.dynamics.com/?mi=SysAADClientTable`

**Step 1 — Create a dedicated service account user:**
Navigate to `System Administration > Users` → Create a non-interactive user (e.g., User ID: `svc-procurement-api`, Name: `Procurement API Service Account`). The user must have an email matching an account in Azure AD — **it cannot be a federated/B2B guest account**. Never use the Admin user.

**Step 2 — Register the Azure AD app:**

1. Navigate to **System Administration > Setup > Azure Active Directory applications** (or "Microsoft Entra ID applications" in newer UI)
2. Click **New**
3. Fill in:
   - **Client ID:** Paste the Application (client) ID from the Azure AD app registration
   - **Name:** `{VendorName} Procurement Platform`
   - **User ID:** Select the dedicated service account user
4. Click **Save**

When the third-party app authenticates using client_credentials with this Client ID + Secret, D365 F&O maps the incoming token to the specified service account user. All API operations execute with that user's security roles.

### B4. Security roles

**D365 security model hierarchy:** Role → Duty → Privilege → Permission (on securable objects including data entities).

**Assigning roles:** Navigate to `System Administration > Users` → Find the service account → Click **Assign roles**.

**Out-of-the-box roles for procurement integration:**

| Role | Use Case |
|---|---|
| Purchasing agent | Create/maintain POs, vendor invoices |
| Sales clerk | Create/maintain sales orders |
| Inventory manager | Inventory management and on-hand |

**Creating a custom role (recommended for least privilege):**

Navigate to `System Administration > Security > Security configuration` → Click **Create new** → Name it (e.g., `Procurement API Integration Role`).

**Key data entities and required access:**

| Data Entity (OData Name) | Purpose | Read-Only | Full CRUD |
|---|---|---|---|
| **PurchaseOrderHeadersV2** | Purchase order headers | Read | Read, Create, Update |
| **PurchaseOrderLinesV2** | Purchase order line items | Read | Read, Create, Update |
| **SalesOrderHeadersV2** | Sales order headers | Read | Read, Create, Update |
| **SalesOrderLinesV2** | Sales order line items | Read | Read, Create, Update |
| **ReleasedProductsV2** | Product/item master data | Read | Read |
| **CustomersV3** | Customer master | Read | Read |
| **VendorsV2** | Vendor master | Read | Read |
| **InventSumEntity / InventOnhandEntities** | Inventory on-hand | Read | Read |

**Mapping privileges to data entities:** Each data entity has two entry points — Data Services (OData) and Data Management (import/export). Create privileges with Object Type = Data Entity, specify the entity name, set Access Level (Read/Create/Update/Delete), and Integration Mode = Data Services. Package these into duties with suffixes like `IntegrationInquire` (read) or `IntegrationMaintain` (write), then assign duties to the custom role.

### B5. OData endpoint configuration

**Base URL:** `https://{environment}.operations.dynamics.com/data/`

**Entity URL construction:**

| Entity | OData URL |
|---|---|
| Purchase Order Headers | `/data/PurchaseOrderHeadersV2` |
| Purchase Order Lines | `/data/PurchaseOrderLinesV2` |
| Sales Order Headers | `/data/SalesOrderHeadersV2` |
| Sales Order Lines | `/data/SalesOrderLinesV2` |
| Released Products | `/data/ReleasedProductsV2` |
| Customers | `/data/CustomersV3` |
| Vendors | `/data/VendorsV2` |
| Inventory On-hand | `/data/InventOnhandEntities` |

**Entity names are case-sensitive.** `/data/batchjobs` returns 404; `/data/BatchJobs` works.

**OData query patterns:**

- `$filter`: `?$filter=PurchaseOrderNumber eq '000123'`
- `$select`: `?$select=PurchaseOrderNumber,OrderVendorAccountNumber`
- `$expand`: `?$expand=PurchaseOrderLines`
- `$top` / `$skip`: `?$top=100&$skip=50`
- `$count`: `?$count=true`
- `$orderby`: `?$orderby=CreatedDateTime desc`

**Cross-company data access:** By default, OData returns data only from the user's **default legal entity**. To query across all companies, append `?cross-company=true`. To filter to a specific company: `?$filter=dataAreaId eq 'USMF'&cross-company=true`.

**Paging:** Maximum page size is **10,000 records**. Use `@odata.nextLink` to paginate through results.

**Entity discovery:** `GET /data/` returns a JSON list of all available entity sets. `GET /data/$metadata` returns the full OData metadata document.

### B6. Testing

**Getting a bearer token via Postman:**

Create a POST request to:
```
https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
```

Body (x-www-form-urlencoded):

| Key | Value |
|---|---|
| grant_type | `client_credentials` |
| client_id | `{Application (Client) ID}` |
| client_secret | `{Secret Value}` |
| scope | `https://{environment}.operations.dynamics.com/.default` |

**Critical:** Do **not** add a trailing slash to the scope URL.

**Expected response:** HTTP 200 with JSON containing `access_token`.

**Making an API call:**
```
GET https://{env}.operations.dynamics.com/data/CustomersV3?$top=3
Headers:
  Authorization: Bearer {access_token}
```
**Expected:** HTTP 200 with `{"@odata.context":"...", "value":[{...}]}`.

**Common errors and fixes:**

| Error | Cause | Fix |
|---|---|---|
| **401 Unauthorized** | App not registered in D365 SysAADClientTable; trailing slash in audience URL; wrong tenant; TLS below 1.2 | Verify Client ID in D365 AAD applications table; decode JWT at jwt.io — verify "aud" matches environment URL without trailing slash |
| **403 Forbidden** | Service account user lacks required security roles | Add appropriate roles to the user in System Administration > Users |
| **404 Not Found** | Wrong entity name (case-sensitive) or incorrect URL | Check exact entity name in `/data/` listing |
| **429 Too Many Requests** | Rate limit exceeded (6,000 requests per 5-minute window per user) | Implement retry with `Retry-After` header; configure throttling priority mapping |
| **AADSTS7000215** | Invalid client secret | Verify secret value (not Secret ID); regenerate if needed |
| **AADSTS700016** | App not found in tenant | Verify correct tenant ID and client ID |

**Throttling priority mapping:** Navigate to `System Administration > Setup > Throttling priority mapping` → Click New → Select the Client ID → Assign priority (High = last to be throttled; Low = first). Default priority for unmapped apps is **High**.

## C. Verification checklist for D365 F&O

- [ ] App Registration created in Azure AD in the correct tenant
- [ ] API permissions granted (Dynamics ERP — AX.FullAccess, CustomService.FullAccess, Odata.FullAccess) with admin consent
- [ ] Client secret configured; **expiry date documented with calendar reminder**
- [ ] App registered in D365: `System Administration > Setup > Azure Active Directory applications` with correct Client ID
- [ ] Dedicated service account user created (not a guest/B2B user)
- [ ] Security roles assigned to the service account with least privilege verified
- [ ] Throttling priority mapping configured
- [ ] Bearer token successfully obtained via Postman (200 response with access_token)
- [ ] All required entity endpoints tested with 200 OK responses
- [ ] Cross-company access tested if needed (`?cross-company=true`)
- [ ] Write operations tested (POST/PATCH) for entities requiring create/update
- [ ] Secret rotation procedure documented
- [ ] Tested in Tier 2+ sandbox before production deployment

**UI verification:** Navigate to `System Administration > Users` → find the service account → click **Assign roles** to see all assigned roles. Navigate to `System Administration > Setup > Azure Active Directory applications` to verify the Client ID mapping.

## D. D365 security best practices

**Least privilege:** For read-only inventory sync, create a custom role with only Read access on InventSumEntity and ReleasedProductsV2Entity. For bidirectional procurement, add Read + Create + Update on PurchaseOrderHeaders/Lines and SalesOrderHeaders/Lines while keeping master data entities at Read only. **Never assign System Administrator to an integration service account.**

**IP restrictions via Azure AD Conditional Access:** For workload identities (service principals), this requires the **Workload Identities Premium license**. Create a Conditional Access policy targeting the specific service principal, restricting to Named Locations (IP ranges) configured at Azure AD > Security > Named Locations. Standard Conditional Access user policies may not fully apply to client_credentials flows — use workload identity-specific policies.

**Credential rotation:** Microsoft recommends secrets of **no longer than 6 months**. Maximum duration is 24 months. Store secrets in Azure Key Vault for centralized management. Automate monitoring with Power Automate flows or PowerShell scripts checking for secrets expiring within a configured window.

**Audit logging:** Azure AD Sign-in Logs monitor service principal sign-ins and detect anomalous patterns. D365 Database Log (configured via `System Administration > Database log setup wizard`) enables logging on critical tables (PurchTable, SalesTable, InventSum). LCS Environment Monitoring provides API call logs, throttled request summaries, and performance data. For advanced monitoring, connect D365 F&O to **Microsoft Sentinel** using the DatabaseLogEntity.

**Legal entity restrictions:** Assign the service account user to specific legal entities via Users > Assign organizations > Grant access to specific organizations. Without `cross-company=true`, data is restricted to the user's default company.

## E. Visual documentation guidance for D365

| Screen | Navigation / URL | Key Fields to Highlight |
|---|---|---|
| App Registration | `portal.azure.com` > Azure AD > App registrations | Application (client) ID, Directory (tenant) ID |
| API Permissions | App registration > API Permissions | Status column ("Granted" with green checkmarks) |
| Certificates & Secrets | App registration > Certificates & secrets | Expiration date, Secret Value (shown only once) |
| AAD Applications in D365 | `https://{env}.operations.dynamics.com/?mi=SysAADClientTable` | Client Id (GUID), Name, User ID columns |
| Users | System Administration > Users | Role assignments panel |
| Security Configuration | System Administration > Security > Security configuration | Duties list, Privilege permissions (CRUD checkboxes) |
| Throttling Priority | System Administration > Setup > Throttling priority mapping | Client ID, Priority dropdown |

**Correct final states:** Azure AD API Permissions page shows all three permissions with **"Granted for {tenant}"** status and green checkmarks. D365 AAD Applications table shows a row with the correct Client ID linked to the service account user. Bearer token request returns **HTTP 200** with a valid JWT. Entity GET request returns **HTTP 200** with `@odata.context` and `value` array.

## F. D365 timeline and complexity

| Scenario | Duration |
|---|---|
| Experienced admin (has done this before) | **30–60 minutes** |
| First-timer with documentation | **2–4 hours** |
| Including custom security role design | **+4–8 hours** |
| Full end-to-end with testing and validation | **1–2 business days** |
| Enterprise with change management approvals | **1–2 weeks** |

**Common blockers:** Azure AD admin access (often a different team, requiring a ticket); security role design (requires D365 functional consultant collaboration); existing Conditional Access policies blocking S2S auth (need exclusions); unclear ownership of secret rotation; TLS version below 1.2 causing silent 401 errors.

**What the platform can automate:** Azure CLI or PowerShell scripts for app registration (`az ad app create`); Terraform resources (`azuread_application`, `azuread_application_password`) for automated registration and rotation; pre-populated Postman collections with token endpoints and entity URLs; setup wizard that pre-fills values and provides copy-paste commands.

---

# Cross-ERP comparison and key takeaways

The three ERPs represent fundamentally different integration architectures. **SAP S/4HANA** uses a transaction-code-driven security model with granular authorization objects — powerful but complex, requiring deep SAP-specific expertise. **NetSuite** offers the most accessible setup through its web-based admin console, but its OAuth 1.0 token-based authentication introduces unique signature and realm-format pitfalls. **D365 F&O** leverages the modern Azure AD identity platform but introduces the dual-admin coordination challenge.

| Factor | SAP S/4HANA (on-prem) | SAP S/4HANA Cloud | NetSuite | D365 F&O |
|---|---|---|---|---|
| **Setup time (experienced)** | 2–3 days | 1 day | 30–60 min | 30–60 min |
| **Setup time (first-timer)** | 2–8 weeks | 1–3 weeks | 2–4 hours | 2–4 hours (+role design) |
| **Auth model** | Basic Auth + CSRF tokens | OAuth 2.0 / Certificates | OAuth 1.0 (TBA) | OAuth 2.0 (client_credentials) |
| **IP whitelisting** | Web Dispatcher / firewall | Not supported (use mTLS) | Role-based IP rules | Azure AD Conditional Access |
| **Credential rotation** | Manual password change | Via Communication User app | Create new token, revoke old | Multiple active secrets |
| **#1 gotcha** | Forgetting to generate PFCG profile | Missing Communication Scenario | REST Web Services not enabled | Entity names are case-sensitive |

For the **in-app setup wizard**, the highest-impact features would be: a "test connection" button that validates credentials before the customer exits the setup flow; pre-built role/permission templates that customers can import directly; real-time validation of each step before allowing progression to the next; and clear callout boxes warning about the one-time-display credentials (NetSuite Consumer Key/Secret and Token ID/Secret, Azure AD client secret value) that cannot be retrieved later.