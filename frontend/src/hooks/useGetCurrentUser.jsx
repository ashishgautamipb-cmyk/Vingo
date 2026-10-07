import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData, clearUserData, setAuthInitialized } from "../redux/userSlice";

const useGetCurrentUser = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        let isMounted = true;

        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                if (isMounted) {
                    dispatch(setAuthInitialized(true));
                }
                return;
            }

            try {
                const result = await axios.get(
                    `${serverUrl}/api/user/current-user`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (isMounted) {
                    dispatch(setUserData(result.data));
                }
            } catch (error) {
                console.warn(
                    "CURRENT USER ERROR:",
                    error.response?.data?.message || error.message
                );

                if (error.response?.status === 401 || error.response?.status === 404) {
                    localStorage.removeItem("token");
                }

                if (isMounted) {
                    dispatch(clearUserData());
                }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };
    }, [dispatch]);
};

export default useGetCurrentUser;