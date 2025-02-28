import React from 'react';
import { Container } from 'react-bootstrap';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import '../styles/breadcrumbs.css';

function Compon_breadcrumps({ links }) {

    return (
        <Container fluid className='p-0'>

            <Breadcrumb>
                {links.map((link, index) => (
                    (index === links.length - 1 ? (
                        <Breadcrumb.Item href={link.url} active><span className='bread-crumps-title-active'>{link.title}</span></Breadcrumb.Item>
                    ) : (
                        <Breadcrumb.Item href={link.url} className='bread-crumps-link'><span className='m-0 bread-crumps-title'>{link.title}</span></Breadcrumb.Item>
                    ))

                ))}
            </Breadcrumb>
        </Container>
    );
}

export default Compon_breadcrumps;