import type { Dispatch, SetStateAction } from "react";
import { Link, Form } from "react-router";

type Props = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  authenticated: boolean;
};

const Sidebar = ({ open, setOpen, authenticated }: Props) => {

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
              <li className="px-4">
                <span className="text-base font-normal text-gray-500">
                  - アカウント -
                </span>
              </li>
              {authenticated ? (
                <li>
                  <Form method="post" action="/admin/logout">
                    <button
                      type="submit"
                      className="group flex w-full items-center rounded-lg px-4 py-2 text-base font-normal hover:bg-base-100"
                    >
                      <svg
                        className="group-hover size-6 text-gray-500 transition duration-75"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-3">ログアウト</span>
                    </button>
                  </Form>
                </li>
              ) : (
                <li>
                  <Link
                    to="/admin/login"
                    className="group flex items-center rounded-lg px-4 py-2 text-base font-normal hover:bg-base-100"
                  >
                    <svg
                      className="group-hover size-6 text-gray-500 transition duration-75"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3">ログイン</span>
                  </Link>
                </li>
              )}
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
