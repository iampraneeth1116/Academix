const Announcements = () => {
  const announcements = [
    {
      id: 1,
      title: "Lorem ipsum dolor sit",
      date: "2025-01-01",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, expedita. Rerum, quidem facilis?",
      color: "bg-blue-50 border-l-4 border-blue-400",
    },
    {
      id: 2,
      title: "Lorem ipsum dolor sit",
      date: "2025-01-01",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, expedita. Rerum, quidem facilis?",
      color: "bg-purple-50 border-l-4 border-purple-400",
    },
    {
      id: 3,
      title: "Lorem ipsum dolor sit",
      date: "2025-01-01",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum, expedita. Rerum, quidem facilis?",
      color: "bg-amber-50 border-l-4 border-amber-400",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Announcements</h1>
        <span className="text-sm text-gray-400 cursor-pointer hover:text-gray-600 transition">
          View All
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className={`${item.color} p-4 rounded-xl shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-700">{item.title}</h2>
              <span className="text-xs text-gray-500 bg-white rounded-md px-2 py-1">
                {item.date}
              </span>
            </div>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
