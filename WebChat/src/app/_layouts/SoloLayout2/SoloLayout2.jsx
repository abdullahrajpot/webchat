import {
  JumboLayout,
  JumboLayoutProvider,
} from "@jumbo/components/JumboLayout";
import { Outlet } from "react-router-dom";
import { defaultLayoutConfig, soloLayoutConfig } from "@app/_config/layouts";
import { Footer} from "@app/_components/layout";
import { Header2 } from "@app/_components/layout/Header2/Header2";


export function SoloLayout2() {
  return (
    <JumboLayoutProvider layoutConfig={ soloLayoutConfig}>
      <JumboLayout
        header={<Header2 />}
        footer={<Footer />}
       
      >
        <Outlet />
      </JumboLayout>
    </JumboLayoutProvider>
  );
}
