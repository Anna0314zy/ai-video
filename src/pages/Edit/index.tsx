import { useParams } from 'react-router-dom';
export default ()=>{
    let { id } = useParams();
    return <div>编辑{id}</div>
}