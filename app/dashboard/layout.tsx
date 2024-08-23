import SideNav from "@/app/ui/dashboard/sidenav";

interface Props {
  children: React.ReactNode;
  modal: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children, modal }) => {
  console.log({ modal });
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div>{modal}</div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
};

export default Layout;
