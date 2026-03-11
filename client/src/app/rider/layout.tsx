import type { ReactNode } from "react";

import AppShellRider from "../../components/appshelRider";

type RiderLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RiderLayout({ children }: RiderLayoutProps) {
  return <AppShellRider>{children}</AppShellRider>;
}
