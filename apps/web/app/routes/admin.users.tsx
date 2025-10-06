import { redirect, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { isAuthenticated } from "~/lib/isAuthenticated";
import Layout from "~/components/layouts/Layout";
import { getApiBaseUrl } from "~/lib/api";

export async function loader(args: LoaderFunctionArgs) {
  const authenticated = await isAuthenticated(args);
  if (!authenticated) return redirect("/admin/login");

  try {
    const apiBaseUrl = getApiBaseUrl(args.request);
    const response = await fetch(`${apiBaseUrl}/api/users`, {
      headers: {
        Authorization: args.request.headers.get("Authorization") || "",
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const apiResponse = (await response.json()) as {
      success: boolean;
      data: any[];
    };
    const users = apiResponse.data || [];

    return { users, authenticated };
  } catch (error) {
    console.error("Error fetching users from API:", error);
    return { users: [], authenticated };
  }
}

export default function AdminUsers() {
  const { users, authenticated } = useLoaderData<typeof loader>();

  return (
    <>
      <Layout authenticated={authenticated}>
        <div className="grid grid-cols-1 gap-4">
          <div className="card w-full bg-base-200">
            <div className="card-body">
              <h2 className="card-title">ユーザー管理</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>id</th>
                    <th>email</th>
                    <th>created_at</th>
                    <th>updated_at</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user: any) => (
                    <tr key={user.id} className="">
                      <td>
                        <div className="font-mono text-sm">{user.id}</div>
                      </td>
                      <td>
                        <div className="font-mono text-sm">{user.email}</div>
                      </td>
                      <td>
                        <div className="text-sm">{user.createdAt}</div>
                      </td>
                      <td>
                        <div className="text-sm">{user.updatedAt}</div>
                      </td>
                      <td className="w-1/12">
                        <div className="dropdown dropdown-left">
                          <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-square btn-md"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              className="inline-block size-5 stroke-current"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                              ></path>
                            </svg>
                          </div>
                          <ul
                            tabIndex={0}
                            className="menu dropdown-content z-[1] w-20 space-y-2 rounded-box bg-base-200 shadow"
                          >
                            <li>
                              <button
                                className="btn btn-primary"
                                onClick={() => {}}
                              >
                                編集
                              </button>
                            </li>
                            <li>
                              <button
                                className="btn btn-error"
                                onClick={() => {}}
                              >
                                削除
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
