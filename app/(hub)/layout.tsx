import { Header } from "@/components/header";

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-68px)]">{children}</main>
    </>
  );
}
