import React from "react";
import { useSelector } from "react-redux";

import Nav from "../components/Nav";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";

function Home() {
  const { userData } = useSelector((state) => state.user);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6]">

      {/* Navbar */}
      <Nav />

      {/* Dashboard */}
      <div className="pt-[100px] flex flex-col items-center">

        {userData?.role === "user" && <UserDashboard />}

        {userData?.role === "owner" && <OwnerDashboard />}

        {userData?.role === "deliveryBoy" && <DeliveryBoy />}

      </div>

    </div>
  );
}

export default Home;