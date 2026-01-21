import { Image } from "react-bootstrap";


export default function HomeManager() {

    return <div>
        <div className=" d-flex justify-content-between align-items-center m-0">
            <div>
                <h3 className="fs-2 fw-bold m-0 my-1 ">Welcome, Ngọc Doanh</h3>
                <p className="fs-5 m-0">
                    Here is your agenda for today
                </p>
            </div>
            <div>
                <h1 className="fs-1 m-0 me-5">
                    <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTabqZ1tRkL0n65oqIXT_uPLaJy_MU7E_5ZYA&s" roundedCircle height={100} />
                </h1>
            </div>
        </div>

    </div>
}