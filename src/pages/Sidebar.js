import React, { Component } from 'react';
import { Route, Routes } from 'react-router-dom';
import '../styles/sidebar.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import requests from '../pages/RequestsService';
import testing from '../pages/Testing';
import panel_admin from '../pages/Panel_admin';
import Educational_materials from '../pages/Educational_materials';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';

class Sidebar extends Component {


    constructor(props) {
        super(props);
        this.state = { role: null, exit: false }
    }

    componentDidMount() {
        if (localStorage.getItem("token")) {

            axios
                .get("/user",
                    {
                        headers: {
                            Authorization: 'Bearer ' + localStorage.getItem("token") //the token is a variable which holds the token
                        }
                    })
                .then((response) => {
                    this.setState({...this.state, role: response.data['roles'][0]['name'] });
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    logout() {
        localStorage.removeItem("token");
        window.location.assign("/");
    }

    showLogout() {
        this.setState({ ...this.state, exit: true })
    }

    render() {
        return (
            <>
                <div className='container-fluid sid'>
                    <div className='row'>
                        <div className='bg-white col-auto d-flex justify-content-between flex-column shadow sidebar-sh p-3'>
                            <a href='/' className='text-decoration-none text-dark d-flex d-none d-md-inline align-itemcenter'>
                                <span className='fs-4'>Меню</span>
                            </a>
                            <hr className='text-secondary d-none d-md-inline'></hr>
                            <ul className="nav nav-pills flex-column">
                                <li className="nav-item text-white fs-6 cnt-names-sect">
                                    <a href="/" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-house-door icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Главная</p>
                                    </a>
                                </li>
                                <li className="nav-item text-white fs-1 mt-2 cnt-names-sect">
                                    <a href="/educational_materials" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-book icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Учебные материалы</p>
                                    </a>
                                </li>
                                <li className="nav-item text-white fs-4 mt-2 cnt-names-sect">
                                    <a href="/testing" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-card-list icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Тренировочные тесты</p>
                                    </a>
                                </li>
                                <li className="nav-item text-white fs-4 mt-2 cnt-names-sect">
                                    <a href="/requests" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-clipboard-check icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Заявки</p>
                                    </a>
                                </li>
                                {this.state.role == "ROLE_ADMIN" ? <li className="nav-item text-white fs-4 mt-2 cnt-names-sect">
                                    <a href="panel_admin" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-person-lines-fill icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Панель администратора</p>
                                    </a>
                                </li> :
                                    ''}

                                <li className="nav-item text-white fs-4 mt-2 cnt-names-sect">
                                    <a href="/settings" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-gear icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Настройки</p>
                                    </a>
                                </li>

                                <hr className='text-secondary mt-3 hr-with-out'></hr>
                                <li style={{cursor: 'pointer'}} className="nav-item text-white fs-4" onClick={this.showLogout.bind(this)}>
                                    <a className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                        <i className='bi bi-box-arrow-left icon-sidebar'></i>
                                        <p className='ms-2 d-none d-md-inline text-sidebar'>Выход</p>
                                    </a>
                                </li>

                            </ul>

                        </div>
                    </div>

                </div>

                <Modal
                    show={this.state.exit}
                    onHide={() => this.setState({ ...this.state, exit: false })}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Выход
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5 className='fw-light'>Вы действительно хотите выйти из аккаунта?</h5>
                        <Button className="mt-3 mb-2 btn_delete_chapter-service" onClick={this.logout}>Выйти</Button>
                    </Modal.Body>

                </Modal>
            </>
        );
    }
}

export default Sidebar;