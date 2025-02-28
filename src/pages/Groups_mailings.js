import React from 'react';
import { Button, Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Sidebar from '../components/Sidebar';
import '../styles/groups_mailing.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Modal } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { Regex } from 'react-bootstrap-icons';
import { useState, useEffect } from 'react';

function Groups_malings(props) {
    const [showCreateGroupMailing, setShowCreateGroupMailing] = useState(false);
    const [showUpdateGroupMailing, setShowUpdateGroupMailing] = useState(false);
    const [showDeleteGroupMailing, setShowDeleteGroupMailing] = useState(false);

    const [showCreateGroupMember, setShowCreateGroupMember] = useState(false);
    const [showUpdateGroupMember, setShowUpdateGroupMember] = useState(false);
    const [showDeleteGroupMember, setShowDeleteGroupMember] = useState(false);

    const [allMailingGroups, setAllMailingGroups] = useState(null);

    const [isAdmin, setIsAdmin] = useState(false);

    const [groupData, setGroupData] = useState({name: ""});
    const [memberData, setMemberData] = useState({name: "", email: "", groupId: ""});

    const [errors, setErrors] = useState({groupName: "", memberName: "", memberEmail: ""});

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            window.location.assign("login");
        }
        else {
            axios.get('/user', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                if (response.data.roles[0].name != 'ROLE_ADMIN') {
                    window.location.assign("login");
                }
                else {
                    setIsAdmin(true);
                }
            })
                .catch((error) => {
                    console.log(error);
                })
        }
    }, [])

    useEffect(() => {
        axios.get('/mailing/all', {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAllMailingGroups(response.data);
            setLoading(false);
        })
        .catch((error) => {
            console.log(error);
        })
    }, [])

    const handleGroupDataChange = (e) => {
        setGroupData({...groupData, name: e.target.value});
        setErrors(prevState => ({...prevState, groupName: ""}));
    }

    const handleSaveGroup = (e) => {
        if(!groupData.name){
            setErrors(prevState => ({...prevState, groupName: "Название группы не должно быть пустым"}));
            return;
        }
        else if(groupData.name.length > 80){
            setErrors(prevState => ({...prevState, groupName: "Название группы не должно быть длиннее 80 символов"}));
            return;
        }

        axios.post('/mailing/group', groupData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAllMailingGroups([...allMailingGroups, response.data]);
            setShowCreateGroupMailing(false);
            setGroupData({name: ''});
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleOpenSaveMemberModal= (e) => {
        setMemberData({...memberData, groupId: e.target.dataset.group}); 
        setShowCreateGroupMember(true);
    }

    const handleMemberDataChange = (e) => {
        setMemberData({...memberData, [e.target.name]: e.target.value});
        if(e.target.name == "name"){
            setErrors(prevState => ({...prevState, memberName: ""}))
        }
        if(e.target.name == "email"){
            setErrors(prevState => ({...prevState, memberEmail: ""}))
        }
    }

    const validateMember = () => {
        let noErrors = true;

        if(!memberData.name){
            setErrors(prevState => ({...prevState, memberName: "название участника не должно быть пустым"}));
            noErrors = false;
        }
        else if(memberData.name.length > 80){
            setErrors(prevState => ({...prevState, memberName: "название участника не должно быть длиннее 80 символов"}));
            noErrors = false;
        }

        let rEmail = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);

        if(!memberData.email){
            setErrors(prevState => ({...prevState, memberEmail: "email участника не должен быть пустой"}));
            noErrors = false;
        }
        else if(!rEmail.test(memberData.email)){
            setErrors(prevState => ({...prevState, memberEmail: "email участника должен быть в формате dosaaf_123@dosaaf.ru"}));
            noErrors = false;
        }
        else if(memberData.email.length > 320){
            setErrors(prevState => ({...prevState, memberEmail: "email участника не должен быть длиннее 320 символов"}));
            noErrors = false;
        }


        return noErrors;
    }

    const handleSaveMember = (e) => {
        if(!validateMember()){
            return;
        }

        axios.post('/mailing/member', memberData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const indexGroup = allMailingGroups.findIndex(group => group.id == response.data.groupId);
            const updatedGroups = allMailingGroups;
            
            if(updatedGroups[indexGroup].members){
                updatedGroups[indexGroup].members.push(response.data);
            }
            else{
                updatedGroups[indexGroup].members = [response.data];
            }

            setAllMailingGroups(updatedGroups);
            setShowCreateGroupMember(false);
            setMemberData({name: "", email: "", groupId: ""});
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleUpdateGroupClick = (e) => {
        axios.get('/mailing/group/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setGroupData(response.data);
            setShowUpdateGroupMailing(true);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleUpdateMemberClick = (e) => {
        axios.get('/mailing/member/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setMemberData(response.data);
            setShowUpdateGroupMember(true);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleUpdateGroup = (e) => {
        if(!groupData.name){
            setErrors(prevState => ({...prevState, groupName: "Название группы не должно быть пустым"}));
            return;
        }
        else if(groupData.name.length > 80){
            setErrors(prevState => ({...prevState, groupName: "Название группы не должно быть длиннее 80 символов"}));
            return;
        }

        axios.put('/mailing/group', groupData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const indexGroup = allMailingGroups.findIndex(group => group.id == response.data.id);
            const updatedGroups = allMailingGroups;
            updatedGroups[indexGroup] = response.data;
            setAllMailingGroups(updatedGroups);
            setShowUpdateGroupMailing(false);
            setGroupData({name: ""});
            setErrors({groupName: "", memberName: "", memberEmail: ""});
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleUpdateMember = (e) => {
        if(!validateMember()){
            return;
        }

        axios.put('/mailing/member', memberData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const indexGroup = allMailingGroups.findIndex(group => group.id == response.data.groupId);
            const indexMember = allMailingGroups[indexGroup].members.findIndex(member => member.id == response.data.id);

            const updatedGroups = [...allMailingGroups];
            updatedGroups[indexGroup].members[indexMember] = response.data;

            setAllMailingGroups(updatedGroups);
            setShowUpdateGroupMember(false);
            setMemberData({name: "", email: "", groupId: ""});
            setErrors({groupName: "", memberName: "", memberEmail: ""});
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteGroupClick = (e) => {
        axios.get('/mailing/group/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setGroupData(response.data);
            setShowDeleteGroupMailing(true);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteGroup = (e) => {
        axios.delete('/mailing/group/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const updatedGroups = allMailingGroups.filter(group => group.id != response.data);
            setAllMailingGroups(updatedGroups);
            setShowDeleteGroupMailing(false);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteMemberClick = (e) => {
        axios.get('/mailing/member/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setMemberData(response.data);
            setShowDeleteGroupMember(true);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    const handleDeleteMember = (e) => {
        axios.delete('/mailing/member/' + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const index = allMailingGroups.findIndex(group => group.members.findIndex(member => member.id == response.data) != -1);
            const updatedGroups = allMailingGroups;
            updatedGroups[index].members = updatedGroups[index].members.filter(member => member.id != response.data);
            setAllMailingGroups(updatedGroups);
            setShowDeleteGroupMember(false);
        })
        .catch((error) => {
            console.log(error);
        })
    }

    if(isAdmin){
        return (
            <>
                <Container fluid className='main-cnt-group-mailing p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className='title-subsection d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center'>Группы для рассылки</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>
                            <Container className='d-flex p-0' fluid>
                                <p className='d-flex align-items-center title-admin-add m-0'>Добавить группу?</p>
                                <Button className='ms-4 btn-admin-add' onClick={() => setShowCreateGroupMailing(true)}>Добавить</Button>
                            </Container>

                            {loading ?
                                <Container fluid className='d-flex justify-center mt-3'>
                                    <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                    </svg>
                                </Container>
                            :allMailingGroups && allMailingGroups.length > 0 ? 
                                allMailingGroups.map(group => (
                                    <Container fluid className='p-4 cnt-group-mailing rounded mt-4 shadow-sm' key={group.id}>
                                        <Container className='d-flex justify-content-end'>
                                            <Button className='edit_group_mailing d-flex justify-content-center align-items-center' data-id={group.id} onClick={handleUpdateGroupClick}><i className="bi bi-pencil icon_disabled"></i></Button>
                                            <Button className='delete_group_mailing ms-2 d-flex justify-content-center align-items-center' data-id={group.id} onClick={handleDeleteGroupClick}><i className="bi bi-trash3 icon_disabled"></i></Button>
                                        </Container>
                                        <p className='title-group-mailing-name mb-0 mt-2'>{group.name}</p>
                                        <Row xs={1} md={1} lg={2} xxl={2}>
                                            {group.members && group.members.length ? 
                                                group.members.map(member => (
                                                    <Col key={member.id}>
                                                        <Container fluid className='p-3 cnt-group-mailing-position rounded mt-3'>
                                                            <Container fluid className='p-0 d-flex cnt-name-email-group'>
                                                                <i className="bi bi-people group-position-icon"></i>
                                                                <Container fluid className='p-0 ms-2 cnt-control-width-name-email'>
                                                                    <p className='mb-0 group-position-title'>Имя участника группы</p>
                                                                    <p className='mb-0 group-position-name-email'>{member.name}</p>
                                                                </Container>
                                                            </Container>
                                                            <Container fluid className='p-0 d-flex mt-3 cnt-name-email-group'>
                                                                <i className="bi bi-envelope-open group-position-icon"></i>
                                                                <Container fluid className='p-0 ms-2 cnt-control-width-name-email'>
                                                                    <p className='mb-0 group-position-title'>Email участника группы</p>
                                                                    <p className='mb-0 group-position-name-email'>{member.email}</p>
                                                                </Container>
                                                            </Container>
                                                            <Container fluid className='d-flex justify-content-between p-0 mt-4 cnt-btn-edit-delete-group-position'>
                                                                <Button className='btn-edit-group-position d-flex justify-content-center align-items-center' data-id={member.id} onClick={handleUpdateMemberClick}><p className='m-0 text-in-button-group-mailing icon_disabled'>Изменить</p><i className="bi bi-pencil icon_disabled icon-in-button-group-mailing"></i></Button>
                                                                <Button className='btn-delete-group-position d-flex justify-content-center align-items-center' data-id={member.id} onClick={handleDeleteMemberClick}><p className='m-0 text-in-button-group-mailing icon_disabled'>Удалить</p><i className="bi bi-trash3 icon_disabled icon-in-button-group-mailing"></i></Button>
                                                            </Container>
                                                        </Container>
                                                    </Col>
                                                ))
                                                
                                            : <p className='mx-1'>Участников группы еще не добавлено</p>}
                                        </Row>
                                        <Container className='d-flex justify-content-start p-0 mt-4 cnt-btn-edit-delete-group-position' fluid>
                                            <Button className='btn-plus-group-position fw-light d-flex justify-content-center align-items-center' data-group={group.id} onClick={handleOpenSaveMemberModal}><i className='bi bi-plus icon_disabled'></i></Button>
                                            <p className='text-secondary ms-3 d-block mt-auto my-auto add-position-group-title'>Добавить участника в группу</p>
                                        </Container>
                                    </Container>
                                ))
                            : 
                            <p className='mx-auto text-center mt-3'>Групп для рассылки еще не создано</p>}
                        </Col >
                    </Row >

                    <Modal
                        show={showCreateGroupMailing}
                        onHide={() => {setShowCreateGroupMailing(false); setErrors({groupName: "", memberName: "", memberEmail: ""});}}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className='modal-group-mailing-title'>
                                Добавить группу для рассылки
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='d-flex flex-column'>
                            <Form.Control type='text' placeholder='Введите наименование группы' onChange={handleGroupDataChange}
                                className='input-modal-group-mailing shadow-sm' />
                            <Form.Label className='mx-1 text-danger'>{errors.groupName}</Form.Label>
                            <Button className='mt-2 btn-modal-group-mailing-save' onClick={handleSaveGroup}>Сохранить</Button>
                        </Modal.Body>
                    </Modal>

                    <Modal
                        show={showCreateGroupMember}
                        onHide={() => {setShowCreateGroupMember(false); setErrors({groupName: "", memberName: "", memberEmail: ""});}}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title className='modal-group-mailing-title'>
                                Добавить участника группы
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='d-flex flex-column'>
                            <Form.Control type='text' name="name" placeholder='Введите имя участника' onChange={handleMemberDataChange}
                                className='input-modal-group-mailing shadow-sm' />
                            <Form.Label className='text-danger mx-1'>{errors.memberName}</Form.Label>
                            <Form.Control type='text' name="email" placeholder='Введите Email участника' onChange={handleMemberDataChange}
                                className='input-modal-group-mailing shadow-sm mt-2' />
                            <Form.Label className='text-danger mx-1'>{errors.memberEmail}</Form.Label>
                            <Button className='mt-3 btn-modal-group-mailing-save' onClick={handleSaveMember}>Сохранить</Button>
                        </Modal.Body>
                    </Modal>
                    
                    {groupData ? 
                        <Modal
                            show={showUpdateGroupMailing}
                            onHide={() => {setShowUpdateGroupMailing(false); setErrors({groupName: "", memberName: "", memberEmail: ""});}}
                            >
                            <Modal.Header closeButton>
                                <Modal.Title className='modal-group-mailing-title'>
                                    Изменить группу для рассылки
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className='d-flex flex-column'>
                                <Form.Control type='text' defaultValue={groupData.name} placeholder='Введите наименование группы' onChange={handleGroupDataChange}
                                    className='input-modal-group-mailing shadow-sm' />
                                <Form.Label className='mx-1 text-danger'>{errors.groupName}</Form.Label>
                                <Button className='mt-2 btn-modal-group-mailing-save' onClick={handleUpdateGroup}>Сохранить</Button>
                            </Modal.Body>
                        </Modal>
                    : ""}

                    {memberData ? 
                        <Modal
                            show={showUpdateGroupMember}
                            onHide={() => {setShowUpdateGroupMember(false); setErrors({groupName: "", memberName: "", memberEmail: ""});}}
                        >
                            <Modal.Header closeButton>
                                <Modal.Title className='modal-group-mailing-title'>
                                    Изменить участника группы
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body className='d-flex flex-column'>
                                <Form.Control type='text' defaultValue={memberData.name} name="name" placeholder='Введите имя участника' onChange={handleMemberDataChange}
                                    className='input-modal-group-mailing shadow-sm' />
                                <Form.Label className='text-danger mx-1'>{errors.memberName}</Form.Label>
                                <Form.Control type='text' defaultValue={memberData.email} name="email" placeholder='Введите Email участника' onChange={handleMemberDataChange}
                                    className='input-modal-group-mailing shadow-sm mt-2' />
                                <Form.Label className='text-danger mx-1'>{errors.memberEmail}</Form.Label>
                                <Button className='mt-3 btn-modal-group-mailing-save' onClick={handleUpdateMember}>Сохранить</Button>
                            </Modal.Body>
                        </Modal>
                    : ""}

                    {groupData ? 
                        <Modal
                            show={showDeleteGroupMailing}
                            onHide={() => setShowDeleteGroupMailing(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    Удаление группы
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <h5 className='fw-light'>Вы действительно хотите удалить группу <span className="fw-bold">{groupData.name}</span> со всеми участниками в ней?</h5>
                                <Button className="mt-3 mb-2 btn_delete_chapter-service " data-id={groupData.id} onClick={handleDeleteGroup}>Удалить</Button>
                            </Modal.Body>
                        </Modal>
                    : ""}

                    {memberData ? 
                        <Modal
                            show={showDeleteGroupMember}
                            onHide={() => setShowDeleteGroupMember(false)}>
                            <Modal.Header closeButton>
                                <Modal.Title>
                                    Удаление группы
                                </Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <h5 className='fw-light'>Вы действительно хотите удалить участника <span className="fw-bold">{memberData.name}</span></h5>
                                <Button className="mt-3 mb-2 btn_delete_chapter-service " data-id={memberData.id} onClick={handleDeleteMember}>Удалить</Button>
                            </Modal.Body>
                        </Modal>
                    : ""}
                    
                </Container >
            </>
        );
    }
}

export default Groups_malings;