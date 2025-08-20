import {
  JumboLayout,
  JumboLayoutProvider,
} from "@jumbo/components/JumboLayout";
import { Outlet } from "react-router-dom";
import { defaultLayoutConfig } from "@app/_config/layouts";

export function SoloLayout() {
  return (
    <JumboLayoutProvider layoutConfig={defaultLayoutConfig}>
      <JumboLayout
      >
        <Outlet />
      </JumboLayout>
    </JumboLayoutProvider>
  );
}
