import {
  JumboLayout,
  JumboLayoutProvider,
} from "@jumbo/components/JumboLayout";
import { Outlet } from "react-router-dom";
import { defaultLayoutConfig } from "@app/_config/layouts";
import { Header2 } from "@app/_components/layout/Header2/Header2";
import { Footer } from "@app/_components/layout";

export function SoloLayout() {
  return (
    <JumboLayoutProvider layoutConfig={defaultLayoutConfig}>
      <JumboLayout
        header={<Header2 />}
        footer={<Footer />}
      >
        <Outlet />
      </JumboLayout>
    </JumboLayoutProvider>
  );
}
