import { useState, useEffect } from "react";
import {
  HiAnnotation,
  HiDocumentText,
  HiOutlineUserGroup,
} from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "flowbite-react";
import CategoryBadge from "./CategoryBadge";
import DashStatCard from "./DashStatCard";
import DashSectionCard from "./DashSectionCard";

export default function DashboardOverview() {
  const { currentUser } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [posts, setPosts] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [lastMonthUsers, setLastMonthUsers] = useState(0);
  const [lastMonthComments, setLastMonthComments] = useState(0);
  const [lastMonthPosts, setLastMonthPosts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await fetch("/api/stats");
      const data = await response.json();
      if (response.ok) {
        setTotalUsers(data.users.total);
        setLastMonthUsers(data.users.lastMonth);
        setTotalComments(data.comments.total);
        setLastMonthComments(data.comments.lastMonth);
        setTotalPosts(data.posts.total);
        setLastMonthPosts(data.posts.lastMonth);
      }
    };
    const fetchUsers = async () => {
      const response = await fetch("/api/users?limit=5");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      }
    };
    const fetchComments = async () => {
      const response = await fetch("/api/comments?limit=5");
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments);
      }
    };
    const fetchPosts = async () => {
      const response = await fetch("/api/posts?limit=5");
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts);
      }
    };

    const loadOverview = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchStats(),
          fetchUsers(),
          fetchComments(),
          fetchPosts(),
        ]);
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser.isAdmin) {
      loadOverview();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashStatCard
          title="Korisnici"
          total={totalUsers}
          lastMonth={lastMonthUsers}
          icon={HiOutlineUserGroup}
          iconClass="bg-fon-navy"
        />
        <DashStatCard
          title="Komentari"
          total={totalComments}
          lastMonth={lastMonthComments}
          icon={HiAnnotation}
          iconClass="bg-fon-magenta"
        />
        <DashStatCard
          title="Objave"
          total={totalPosts}
          lastMonth={lastMonthPosts}
          icon={HiDocumentText}
          iconClass="bg-fon-teal"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashSectionCard
          title="Nedavni korisnici"
          to="/dashboard?tab=users"
          isEmpty={users.length === 0}
          emptyMessage="Još nema korisnika"
        >
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Korisnik</TableHeadCell>
                <TableHeadCell>Email</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {users.map((user) => (
                <TableRow
                  key={user._id}
                  className="bg-white dark:border-fon-dark-border dark:bg-fon-dark"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <span className="font-medium text-fon-navy dark:text-white">
                        {user.username}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-fon-muted dark:text-fon-dark-muted">
                    {user.email}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashSectionCard>

        <DashSectionCard
          title="Nedavni komentari"
          to="/dashboard?tab=comments"
          isEmpty={comments.length === 0}
          emptyMessage="Još nema komentara"
        >
          <Table hoverable>
            <TableHead>
              <TableRow>
                <TableHeadCell>Komentar</TableHeadCell>
                <TableHeadCell>Objava</TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody className="divide-y">
              {comments.map((comment) => (
                <TableRow
                  key={comment._id}
                  className="bg-white dark:border-fon-dark-border dark:bg-fon-dark"
                >
                  <TableCell className="max-w-xs">
                    <p className="line-clamp-2 text-fon-text dark:text-fon-dark-text">
                      {comment.content}
                    </p>
                  </TableCell>
                  <TableCell>
                    {comment.postId?.slug ? (
                      <Link
                        to={`/post/${comment.postId.slug}`}
                        className="text-sm font-medium text-fon-navy hover:text-fon-magenta dark:text-white dark:hover:text-fon-magenta"
                      >
                        {comment.postId.title}
                      </Link>
                    ) : (
                      <span className="text-fon-muted dark:text-fon-dark-muted">
                        obrisana objava
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashSectionCard>
      </div>

      <DashSectionCard
        title="Nedavne objave"
        to="/dashboard?tab=posts"
        isEmpty={posts.length === 0}
        emptyMessage="Još nema objava"
      >
        <Table hoverable>
          <TableHead>
            <TableRow>
              <TableHeadCell>Objava</TableHeadCell>
              <TableHeadCell>Kategorija</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {posts.map((post) => (
              <TableRow
                key={post._id}
                className="bg-white dark:border-fon-dark-border dark:bg-fon-dark"
              >
                <TableCell>
                  <Link
                    to={`/post/${post.slug}`}
                    className="flex items-center gap-3"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-12 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <span className="font-medium text-fon-navy hover:text-fon-magenta dark:text-white dark:hover:text-fon-magenta">
                      {post.title}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <CategoryBadge slug={post.category} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashSectionCard>
    </div>
  );
}
