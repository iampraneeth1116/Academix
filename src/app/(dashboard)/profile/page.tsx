// app/(dashboard)/profile/page.tsx
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Image from "next/image";

export default async function ProfilePage() {
  const token = (await cookies()).get("accessToken")?.value;
  if (!token)
    return <div className="p-6 text-red-500">Unauthorized</div>;

  let user: any;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return <div className="p-6 text-red-500">Invalid Token</div>;
  }

  const loginUser = await prisma.userLogin.findUnique({
    where: { username: user.username },
  });

  if (!loginUser)
    return <div className="p-6 text-red-500">User not found</div>;

  // Fetch actual profile based on role
  let profile: any = null;

  switch (loginUser.userType) {
    case "ADMIN":
      profile = await prisma.admin.findUnique({
        where: { id: loginUser.userId },
      });
      break;

    case "TEACHER":
      profile = await prisma.teacher.findUnique({
        where: { id: loginUser.userId },
      });
      break;

    case "STUDENT":
      profile = await prisma.student.findUnique({
        where: { id: loginUser.userId },
      });
      break;

    case "PARENT":
      profile = await prisma.parent.findUnique({
        where: { id: loginUser.userId },
      });
      break;
  }

  if (!profile)
    return <div className="p-6 text-red-500">Profile not found</div>;

  // Avatar fallback images
  const avatar =
    profile.img ||
    "/profilepage.png";

  // Role-based header image
  const bannerMap: any = {
    ADMIN:
      "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg",
    TEACHER:
      "https://images.pexels.com/photos/3184611/pexels-photo-3184611.jpeg",
    STUDENT:
      "https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg",
    PARENT:
      "https://images.pexels.com/photos/4473871/pexels-photo-4473871.jpeg",
  };

  const banner = bannerMap[loginUser.userType];

  return (
    <div className="m-4 mt-0 p-0 rounded-2xl overflow-hidden bg-gray-50 shadow-sm border border-gray-200">

      {/* HEADER BANNER */}
      <div className="relative h-48 w-full">
        <Image
          src={banner}
          alt="Banner"
          fill
          className="object-cover brightness-75"
        />

        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* PROFILE CARD */}
      <div className="relative -mt-16 px-6 pb-10">
        <div className="flex flex-col items-center text-center">

          {/* Avatar */}
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-2xl bg-white">
            <Image
              src={avatar}
              alt="Profile"
              width={128}
              height={128}
              className="object-cover"
            />
          </div>

          {/* Name */}
          <h1 className="text-3xl font-semibold mt-4 tracking-tight">
            {profile.name
              ? `${profile.name} ${profile.surname ?? ""}`
              : loginUser.username}
          </h1>

          {/* Role */}
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-wide">
            {loginUser.userType}
          </p>

          <p className="text-gray-400 text-xs mt-1">
            Member since {new Date(profile.createdAt ?? Date.now()).getFullYear()}
          </p>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

          <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
            <p className="text-gray-500 text-xs">Username</p>
            <p className="font-medium text-lg mt-1">{loginUser.username}</p>
          </div>

          <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
            <p className="text-gray-500 text-xs">Profile ID</p>
            <p className="font-medium text-lg mt-1">{profile.id}</p>
          </div>

          {"email" in profile && profile.email && (
            <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="text-gray-500 text-xs">Email</p>
              <p className="font-medium text-lg mt-1">{profile.email}</p>
            </div>
          )}

          {"phone" in profile && profile.phone && (
            <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition">
              <p className="text-gray-500 text-xs">Phone</p>
              <p className="font-medium text-lg mt-1">{profile.phone}</p>
            </div>
          )}

          {"address" in profile && (
            <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 md:col-span-2 hover:shadow-md transition">
              <p className="text-gray-500 text-xs">Address</p>
              <p className="font-medium text-lg mt-1">{profile.address}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
