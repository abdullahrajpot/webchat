import { useTranslation } from "react-i18next";

export function getMenus() {
  const { t } = useTranslation();
  return [
    {
      label: t("sidebar.menu.sample"),
      children: [
      
         {
          path: "/admindashboard/assign-task",
          label: t("sidebar.menu.AssignTask"),
          icon: "task",
        },
        {
          path: "/admindashboard/chat",
          label: t("sidebar.menu.Chat"),
          icon: "chat",
        },
         {
          path: "/admindashboard/all-tasks",
          label: t("sidebar.menu.AllTasks"),
          icon: "tasklist",
        },
        
      ],
    },
  ];
}
