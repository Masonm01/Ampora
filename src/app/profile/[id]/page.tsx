// interface UserProfileParams {
//   params: { id: string };
// }

// export default function UserProfile({ params }: UserProfileParams) {
//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen py-2">
//             <h1>Profile</h1>
//             <hr />
//             <p className="text-4xl">Profile Page</p>
//             <span className="p-2 rounded bg-blue-500 text-black">{params.id}</span>
//         </div>
//     )
// }

// app/user/[id]/page.tsx
export default async function UserProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <-- await in Next 15

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1>Profile</h1>
      <hr />
      <p className="text-4xl">Profile Page</p>
      <span className="p-2 rounded bg-blue-500 text-black">{id}</span>
    </div>
  );
}
