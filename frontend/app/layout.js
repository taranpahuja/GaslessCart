import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "GaslessCart Storefront",
  description: "Frictionless Web3 E-commerce",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
