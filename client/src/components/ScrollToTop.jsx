import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
  return null;
}
