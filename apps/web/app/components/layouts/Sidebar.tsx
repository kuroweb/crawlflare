import type { Dispatch, SetStateAction } from "react";
import { Link } from "react-router";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const Sidebar = ({ open, setOpen }: Props) => {
  return (
    <>
      <aside
        className={`${
          open ? "flex" : "hidden"
        } transition-width fixed left-0 top-0 z-20 h-full w-64 shrink-0 flex-col pt-16 duration-75 md:flex`}
      >
        <div className="flex h-full min-h-0 flex-1 flex-col bg-base-200">
          <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
            <ul className="space-y-2 pb-2">
              <li className="px-4">
                <span className="text-base font-normal text-gray-500">
                  - 機能 -
                </span>
              </li>
              <li>
                <Link
                  to="/admin/login"
                  className="group flex items-center rounded-lg px-4 py-2 text-base font-normal hover:bg-base-100"
                >
                  <svg
                    className="group-hover size-6 text-gray-500 transition duration-75"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M10.9 2a1 1 0 0 0-.99 1v3a1 1 0 0 0 1.493.87l3.528-2.02l-3.528-2.02A.998.998 0 0 0 10.9 2m-4.3.4A1 1 0 0 0 5.6 3.7l2.01 3.49a1 1 0 0 0 1.74 0l2.01-3.49a1 1 0 0 0-1.74-1L9.6 5.3L8.04 3.4A1 1 0 0 0 6.6 2.4M20 10H4a1 1 0 0 0-.993.883L3 11v2a1 1 0 0 0 .883.993L4 14h16a1 1 0 0 0 .993-.883L21 13v-2a1 1 0 0 0-.883-.993L20 10Z"
                    />
                  </svg>
                  <span className="ml-3">ログイン</span>
                </Link>
              </li>
              <li className="px-4">
                <span className="text-base font-normal text-gray-500">
                  - 管理 -
                </span>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="group flex items-center rounded-lg px-4 py-2 text-base font-normal hover:bg-base-100"
                >
                  <svg
                    className="group-hover size-6 text-gray-500 transition duration-75"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                  <span className="ml-3">管理画面</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="group flex items-center rounded-lg px-4 py-2 text-base font-normal hover:bg-base-100"
                >
                  <svg
                    className="group-hover size-6 text-gray-500 transition duration-75"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                  <span className="ml-3">ユーザー管理</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="group flex items-center rounded-lg px-4 py-2 text-base font-normal hover:bg-base-100"
                >
                  <svg
                    className="group-hover size-6 text-gray-500 transition duration-75"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                  <span className="ml-3">計測管理</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </aside>
      <div
        onClick={() => setOpen(!open)}
        className={`${open ? "" : "hidden"} fixed inset-0 z-10 bg-gray-900 opacity-50`}
      ></div>
    </>
  );
};

export default Sidebar;
