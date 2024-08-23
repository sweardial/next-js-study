import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";

interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

const RootLayout: React.FC<Props> = ({ children }) => {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
};

export default RootLayout;
