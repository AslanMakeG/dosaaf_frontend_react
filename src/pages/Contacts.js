import React from 'react';
import { Breadcrumb, Button, Container } from 'react-bootstrap';
import '../styles/contacts.css';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Contact_label from '../components/Contact_label';
import { useState, useEffect } from 'react';



function Contacts(props) {
    const [ContactAdress, setContactAdress] = useState([['Адрес'], ['г.Кострома ул.Галичская 47Б']]);
    const [ContactSchedule, setContactSchedule] = useState([['График работы'], ['Пн-Пт (8:30-17:00)']]);
    const [ContactPnoneNumber, setContactPnoneNumber] = useState([['Номер телефотна'], ['8-(597)-543-56-79']]);
    const [ContactEmail, setContactEmail] = useState([['Email'], ['dosaaf@mail.ru']]);

    return (

        <Container className='cont-news mt-0 px-0 pb-4' fluid>

            <Container className='mt-2 d-flex justify-content-center' >
                <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title mb-0'>КОНТАКТЫ ДОСААФ КОСТРОМА</p>
            </Container>
            <Row xs={1} md={2} lg={2} className='mt-3'>

                <Col>
                    <Container fluid className="p-4  contacts-our-office rounded shadow-sm" >
                        <Container fluid className='d-flex align-items-center p-0'>
                            <i className="bi bi-buildings cnt-contacts-icon"></i>
                            <p className='mb-0 ms-2 contact-title-section'>Наш офис</p>
                        </Container>
                        <hr></hr>
                        <Contact_label tag_icon={<i className="bi bi-geo-alt icon-label"></i>} label_title={ContactAdress[0]} label_desc={ContactAdress[1]} />
                        <Contact_label tag_icon={<i className="bi bi-clock icon-label"></i>} label_title={ContactSchedule[0]} label_desc={ContactSchedule[1]} />

                    </Container>
                </Col>

                <Col>
                    <Container fluid className="p-4  contacts-our-office rounded shadow-sm" >
                        <Container fluid className='d-flex align-items-center p-0'>
                            <i className="bi bi-person-vcard cnt-contacts-icon"></i>
                            <p className='mb-0 ms-2 contact-title-section'>Наши контакты</p>
                        </Container>
                        <hr></hr>
                        <Contact_label tag_icon={<i className="bi bi-telephone icon-label"></i>} label_title={ContactPnoneNumber[0]} label_desc={ContactPnoneNumber[1]} />
                        <Contact_label tag_icon={<i className="bi bi-envelope-open icon-label"></i>} label_title={ContactEmail[0]} label_desc={ContactEmail[1]} />

                    </Container>

                </Col>
            </Row>

            <Container fluid className='p-4 contact-cnt-map rounded shadow-sm mt-4'>
                <Container fluid className='d-flex align-items-center p-0'>
                    <i className="bi bi-map cnt-contacts-icon"></i>
                    <p className='mb-0 ms-2 contact-title-section'>Местоположение</p>
                </Container>
                <hr></hr>
                <iframe className='contact-map mt-3' src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2127.5066229556755!2d40.945105612653386!3d57.775777973790774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46ad4fef1e3bb211%3A0xeaeb5f82dba8a66d!2z0JPQsNC70LjRh9GB0LrQsNGPINGD0LsuLCA0N9CRLCDQmtC-0YHRgtGA0L7QvNCwLCDQmtC-0YHRgtGA0L7QvNGB0LrQsNGPINC-0LHQuy4sIDE1NjAxMw!5e0!3m2!1sru!2sru!4v1717331826380!5m2!1sru!2sru" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </Container>
        </Container>
    );
}

export default Contacts;