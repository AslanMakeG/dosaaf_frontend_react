import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import '../styles/footer.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import logo from './dosaaf_logo.png';
import { useEffect, useState } from 'react';
import axios from 'axios';

class Footer extends Component {

    constructor(props) {
        super(props);
        this.state = { partners: null }
    }

    componentDidMount(){
        axios.get('/partner/all')
        .then((response) => {
            this.setState({ partners: response.data});
        })
        .catch((error) => {
            console.log(error);
        });
    }

    render() {
        return (
            <Container fluid className='footer p-0'>
                <Container fluid className='footer-w p-0'>
                    <Container fluid className='partners-title ms-0 p-4 mt-5'>
                        <p className='my-auto'>Партнеры ДОСААФ</p>
                    </Container>
                    <hr className='hr_partners mt-0'></hr>
                    <Row xs={3} md={4} lg={6}>
                        {this.state.partners ? this.state.partners.map(partner => (
                                <Col>
                                    <a href={partner.link} target='_blank'>
                                        <Container fluid className="photo-cnt-partner p-0 mt-3 d-flex flex-column border border-1 border-secondary border-opacity-50">
                                            <Image
                                                src={axios.defaults.baseURL + partner.imagePath}
                                                height="100%"
                                                width='100%'
                                                className='mx-auto my-auto d-block photo-partner p-1'
                                                alt='Logo'
                                            />
                                        </Container>
                                    </a>
                                </Col>
                        )) 
                        : ""}
                    </Row>
                </Container>
                <Container fluid className='organization-info-footer p-4 mt-3 d-flex justify-content-between'>
                    <Container fluid className='d-flex justify-content-start'>
                        <img
                            src={logo}
                            alt='Logo'
                            className = 'my-auto footer-logo'
                        />
                        <p className='my-auto mx-2 text-secondary fw-light'>|</p>
                        <p className='my-auto text-secondary footer-text'>Официальный сайт ДОСААФ Кострома</p>
                    </Container>
                    <Container fluid className='d-flex flex-column palk'>
                        <p className='my-auto ms-auto text-secondary p-1 footer-text'>Адрес: Кострома, ул. Галичская 47б</p>
                        <p className='my-auto ms-auto text-secondary p-1 footer-text'>Email: dosaaf_kostroma@gmail.com</p>
                    </Container>
                </Container>
            </Container>
        );
    }
}

export default Footer;