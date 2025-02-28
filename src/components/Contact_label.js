import React from 'react';
import { Container } from 'react-bootstrap';
import '../styles/contacts.css';

function contact_label(props) {
    return (
        <Container fluid className='d-flex justify-content-start align-items-center p-0 mt-4'>
            <Container fluid className='p-2 d-flex justify-content-center align-items-center ms-0 cnt-mark rounded sahdow-sm'>
                {props.tag_icon}
            </Container>
            <Container fluid className='p-0'>
                <p className='mb-0 ms-3 label-title'>{props.label_title}</p>
                <p className='mb-0 mt-1 ms-3 text-secondary label-desc'>{props.label_desc}</p>
            </Container>
        </Container>
    );
}

export default contact_label;