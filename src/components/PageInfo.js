import React from 'react';
import { Container, Button } from 'react-bootstrap';
import '../styles/PageInfo.css';

function PageInfo(props) {
    return (
        <Container className='info-page-cnt px-5 py-4 d-flex justify-content-around shadow-sm'>
            <Container fluid className='p-0'>
                <p className='title-page-info mb-0'>{props.title}</p>
                <p className='text-secondary lead description-page-info mb-0 mt-1'>{props.text}</p>
                <Button type="submit" href='/' className="mt-3 btn_info_page d-flex justify-content-center align-items-center shadow-sm">
                    <p className='m-0'>{props.btn_text}</p>
                </Button>
            </Container>
            <img
                src={props.picture}
                className='m-3 page-info-img'
                alt='Logo'
            />
        </Container>
    );
}

export default PageInfo;