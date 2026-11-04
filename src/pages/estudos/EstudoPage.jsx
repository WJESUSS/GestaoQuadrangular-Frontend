import { useParams, Navigate } from "react-router-dom";
import StudyDetailScreen from "../../components/estudos/StudyDetailScreen.jsx";
import { getEstudoById } from "../../data/estudos.js";

export default function EstudoPage() {
    const { estudoId } = useParams();
    const estudo = getEstudoById(estudoId);

    if (!estudo) return <Navigate to="/" replace />;
    return <StudyDetailScreen study={estudo} />;
}
