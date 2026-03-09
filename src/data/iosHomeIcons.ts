export interface HomeIcon {
  name: string;
  src: string;
  isHexa?: boolean;
}

export const homeIcons: HomeIcon[] = [
  { name: "Settings", src: "/icons/settings.png" },
  { name: "App Store", src: "/icons/app-store.svg" },
  { name: "Clock", src: "/icons/clock.jpg" },
  { name: "Calendar", src: "/icons/calendar.jpg" },
  { name: "Messages", src: "/icons/messages.jpg" },
  { name: "Calculator", src: "/icons/calculator.jpg" },
  { name: "Google Maps", src: "/icons/google-maps.jpg" },
  { name: "Spotify", src: "/icons/spotify.jpg" },
  { name: "MyFitnessPal", src: "/icons/myfitnesspal.jpg" },
  { name: "Netflix", src: "/icons/netflix.jpg" },
  { name: "Hexa", src: "", isHexa: true },
  { name: "YouTube", src: "/icons/youtube.jpg" },
];

export const dockIcons: HomeIcon[] = [
  { name: "Phone", src: "/icons/phone.jpg" },
  { name: "Mail", src: "/icons/mail.jpg" },
  { name: "Messages", src: "/icons/messages.jpg" },
  { name: "Camera", src: "/icons/camera.jpg" },
];
