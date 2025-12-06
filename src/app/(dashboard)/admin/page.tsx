import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [keys: string]: string | undefined }>;
}) => {

  const params = await searchParams;  // unwrap once

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      
      {/* LEFT SIDE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">

        {/* TOP CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
        </div>

        {/* CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>

        {/* FINANCE */}
        <div className="w-full h-[500px]">
          <FinanceChart />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={params} />
        <Announcements />
      </div>

    </div>
  );
};

export default AdminPage;
