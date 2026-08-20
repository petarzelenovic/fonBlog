import { Link } from "react-router-dom";
import Logo from "./Logo";
import authHero from "../assets/auth-hero.jpg";

const avatars = [
  { initials: "F", color: "#60C3AD" },
  { initials: "O", color: "#D058A0" },
  { initials: "N", color: "#FFCD67" },
];

export default function AuthLayout({ title, children }) {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-md space-y-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {title}
            </h1>

            {children}
          </div>
        </div>

        <div
          className="relative hidden overflow-hidden bg-cover bg-center lg:flex lg:flex-col lg:justify-between lg:px-16 lg:py-12"
          style={{ backgroundImage: `url(${authHero})` }}
        >
          <div className="absolute inset-0 bg-linear-to-t from-fon-navy/90 via-fon-navy/65 to-fon-navy/45" />

          <Link to="/" className="relative z-10 self-center">
            <Logo className="h-24 w-auto" variant="onDark" />
          </Link>

          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
              Vesti, iskustva i priče sa FON-a.
            </h2>
            <p className="mt-5 text-lg font-light leading-relaxed text-white/80">
              Mesto gde studenti, profesori i alumni Fakulteta organizacionih
              nauka dele vesti i iskustva iz akademskog života.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((avatar) => (
                <span
                  key={avatar.initials}
                  className="inline-flex size-10 items-center justify-center rounded-full text-xs font-bold text-white ring-2 ring-white/40"
                  style={{ backgroundColor: avatar.color }}
                >
                  {avatar.initials}
                </span>
              ))}
            </div>
            <p className="text-sm font-medium text-white">
              Zajednica studenata, profesora i alumni FON-a
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
