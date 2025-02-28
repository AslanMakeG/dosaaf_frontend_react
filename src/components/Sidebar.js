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

class Sidebar extends Component {

    
    constructor(props) {
        super(props);
        this.state = { role: null }
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
                    this.setState({ role: response.data['roles'][0]['name']});
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    logout(){
        localStorage.removeItem("token");
        window.location.assign("/");
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
                            <li className="nav-item text-white fs-4 " onClick={this.logout}>
                                <a href="/" className="nav-link text-dark fs-5 p-1 cnt-icon-text-sidebar" aria-current="page">
                                    <i className='bi bi-box-arrow-left icon-sidebar'></i>
                                    <p className='ms-2 d-none d-md-inline text-sidebar'>Выход</p>
                                </a>
                            </li>

                        </ul>

                    </div>
                </div>

            </div>

            </>
        );
    }
}

export default Sidebar;