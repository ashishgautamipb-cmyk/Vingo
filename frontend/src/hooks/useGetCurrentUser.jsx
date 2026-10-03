import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetCurrentUser = () => {

    const dispatch = useDispatch();

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    console.log(
                        "CURRENT USER: Token not found"
                    );
                    return;
                }

                const result =
                    await axios.get(
                        `${serverUrl}/api/user/current-user`,
                        {
                            withCredentials: true,

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                console.log(
                    "CURRENT USER:",
                    result.data
                );

                dispatch(
                    setUserData(
                        result.data
                    )
                );

            } catch (error) {

                console.log(
                    "CURRENT USER ERROR:",
                    error.response?.data ||
                    error.message
                );

            }

        };

        fetchUser();

    }, [dispatch]);

};

export default useGetCurrentUser;