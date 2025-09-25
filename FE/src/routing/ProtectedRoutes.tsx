import { useEffect, useState } from "react";
import { checkAuth } from "../services/UserData";
import { useNavigate } from "react-router-dom";

const LoggedInRoute = ({children} : {children : React.ReactNode}) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            await checkAuth()
                .then(() => setLoading(false))
                .catch(() => {
                    navigate("/login", { replace: true });
                });
        };

        checkAuthStatus();
    }, []);

    if (loading) return null;

    return <>{children}</>;
};

export default LoggedInRoute;