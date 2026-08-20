import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import DashTabs from "../components/DashTabs";
import DashProfile from "../components/DashProfile";
import DashPosts from "../components/DashPosts";
import DashUsers from "../components/DashUsers";
import DashComments from "../components/DashComments";
import DashCategories from "../components/DashCategories";
import DashboardOverview from "../components/DashboardOverview";

const TAB_META = {
  profile: {
    title: "Profil",
    subtitle: "Ažuriraj podatke o nalogu",
  },
  overview: {
    title: "Pregled",
    subtitle: "Statistika i nedavna aktivnost na Fon Blogu",
  },
  posts: {
    title: "Objave",
    subtitle: "Upravljaj svojim objavama",
  },
  users: {
    title: "Korisnici",
    subtitle: "Pregled i upravljanje korisnicima",
  },
  comments: {
    title: "Komentari",
    subtitle: "Pregled i upravljanje komentarima",
  },
  categories: {
    title: "Kategorije",
    subtitle: "Dodaj, izmeni ili obriši kategorije objava",
  },
};

const ADMIN_TABS = [
  "profile",
  "overview",
  "posts",
  "users",
  "comments",
  "categories",
];
const USER_TABS = ["profile"];

export default function Dashboard() {
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const allowedTabs = currentUser?.isAdmin ? ADMIN_TABS : USER_TABS;
  const tabFromUrl = new URLSearchParams(location.search).get("tab");
  const tab = allowedTabs.includes(tabFromUrl)
    ? tabFromUrl
    : currentUser?.isAdmin
      ? "overview"
      : "profile";
  const meta = TAB_META[tab];

  return (
    <main className="bg-white dark:bg-fon-dark">
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8 lg:pt-10 lg:pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-fon-navy dark:text-white md:text-3xl">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-fon-muted dark:text-fon-dark-muted">
            {meta.subtitle}
          </p>
        </div>

        <DashTabs activeTab={tab} isAdmin={currentUser?.isAdmin} />

        {tab === "profile" && <DashProfile />}
        {tab === "overview" && <DashboardOverview />}
        {tab === "posts" && <DashPosts />}
        {tab === "users" && <DashUsers />}
        {tab === "comments" && <DashComments />}
        {tab === "categories" && <DashCategories />}
      </div>
    </main>
  );
}
