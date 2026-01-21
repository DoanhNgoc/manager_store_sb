import { Button, Image, Table } from "react-bootstrap";
import ItemNotification from "./Notification/ItemNotification";
import ModalNotificationMember from "./Notification/ModalNotificationMember";

export default function InformationMember() {
    function randomDate(start: Date, end: Date): number {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime();
    }
    const datainfomation = [
        {
            title: "title thông báo",
            content: "nội dung thông báo",
            create_at: randomDate(new Date(2023, 0, 1), new Date(2025, 11, 31)),
            is_real: false,
            type: "nhập kho"
        },
        {
            title: "title thông báo",
            content: "nội dung thông báo",
            create_at: randomDate(new Date(2023, 0, 1), new Date(2025, 11, 31)),
            is_real: true,
            type: "nhập kho"
        },
        {
            title: "title thông báo",
            content: "nội dung thông báo",
            create_at: randomDate(new Date(2023, 0, 1), new Date(2025, 11, 31)),
            is_real: true,
            type: "nhập kho"
        }

    ]
    return <div className="rounded-2 bg-light mt-1">
        {/* header */}
        <div className="rounded-top-2 p-2 bg-info d-flex align-items-center justify-content-between">
            {/* id member */}
            <div className="text-light fs-4 fw-bold">
                <span>sbnth_01</span>
            </div>
            {/* button notification and update infomation member */}
            <div className="d-flex align-items-center justify-content-end">
                <ModalNotificationMember />
                <Button variant="primary" className="mx-2 fw-bold">Thông báo</Button>
            </div>
        </div>
        {/* body */}
        <div className="">

            <div className="border-bottom border-dark">
                <div className="row ">
                    {/* avatar member */}
                    <div className="col-2 ">
                        <div className="background p-2 m-2">
                            <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTabqZ1tRkL0n65oqIXT_uPLaJy_MU7E_5ZYA&s" roundedCircle className='w-100' />
                        </div>
                    </div>
                    {/* name and role */}
                    <div className="col-10">
                        <div className="">
                            {/* name */}
                            <p className="fw-bold fs-4 mb-1">Trương Ngọc Doanh</p>
                            {/* role */}
                            <p className="fw-bold fs-5 mb-1 text-secondary">Manager</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* information memeber */}
            <div className="row">
                <div className="col-12 col-md-6 border-end border-dark">
                    <h4 className="fw-bold mx-2 my-1">Thông tin cá nhân</h4>
                    {/* table information */}
                    <div className="m-2">
                        <Table responsive bordered variant="secondary" >
                            <tbody>
                                {/* name */}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        Họ tên
                                    </td>
                                    <td className="align-middle text-start">
                                        Trương Ngọc Doanh
                                    </td>
                                </tr>
                                {/* phone */}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        số điện thoại
                                    </td>
                                    <td className="align-middle text-start">
                                        0365294003
                                    </td>
                                </tr>
                                {/* email */}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        Email
                                    </td>
                                    <td className="align-middle text-start">
                                        doanhngc19@gmail.com
                                    </td>
                                </tr>
                                {/* date of bithday */}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        Ngày sinh
                                    </td>
                                    <td className="align-middle text-start">
                                        30/07/2005
                                    </td>
                                </tr>
                                {/* role */}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        Chức vụ
                                    </td>
                                    <td className="align-middle text-start">
                                        Nhân viên
                                    </td>
                                </tr>
                                {/*  basic salary*/}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        Mức lương
                                    </td>
                                    <td className="align-middle text-start">
                                        21.000 vnđ
                                    </td>
                                </tr>
                                {/* experience */}
                                <tr>
                                    <td className="align-middle text-start fw-bold">
                                        Kinh nghiệm
                                    </td>
                                    <td className="align-middle text-start">
                                        1 năm
                                    </td>
                                </tr>


                            </tbody>
                        </Table>
                    </div>
                </div>
                <div className="col-0 col-md-6">
                    <div className="p-1 d-block">
                        <h4 className="fw-bold mx-2 my-1">Lịch sữ thông báo</h4>
                        {
                            datainfomation.map((item: any, key: number) => <ItemNotification key={key} notification={item} />)
                        }
                    </div>
                </div>
            </div>
        </div>
    </div>
}