import { useSelector } from "react-redux";

import Nav from "../components/Nav";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "./DeliveryBoy";

function Home() {
    const { userData } = useSelector((state) => state.user);

    return (
        <div className="w-full min-h-screen bg-gradient-to-b from-[#faf4ee] via-[#fcf8f5] to-[#ffffff] text-gray-900">
            {/* Top Navigation */}
            <Nav />

            {/* Dashboard Container */}
            <main className="pt-[88px] flex flex-col items-center w-full">
                {userData?.role === "user" && <UserDashboard />}
                {userData?.role === "owner" && <OwnerDashboard />}
                {userData?.role === "deliveryBoy" && <DeliveryBoy />}
            </main>
        </div>
    );
}

export default Home;