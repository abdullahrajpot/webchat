import {
  FacebookOutlined,
  Instagram,
  LinkedIn,
  Mail,
  MessageOutlined,
  NotificationsActiveRounded,
  Refresh,
  Settings,
  TaskAltOutlined,
  Twitter,
  YouTube,
} from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";



const APP_ICONS = [
  {
    name: "sample",
    Component: EditOutlinedIcon,
    props: { sx: { fontSize: 20 } },
  },
   {
    name: "chat",
    Component: ChatOutlinedIcon,
    props: { sx: { fontSize: 20 } },
  },
   {
    name: "task",
    Component: TaskAltOutlined,
    props: { sx: { fontSize: 20 } },
  },
  {
    name: "tasklist",
    Component: ListAltOutlinedIcon,
    props: { sx: { fontSize: 20 } },
  },

];

export { APP_ICONS };
