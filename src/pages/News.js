import React from 'react';
import '../styles/news.css';
import '../styles/loading.css';
import { Button, Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Image from 'react-bootstrap/Image';
import Pagination from 'react-bootstrap/Pagination';
import New from './New';
import { Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';


function News(props) {

    const [allNews, setAllNews] = useState(null);
    const [newsCount, setNewsCount] = useState(null);

    const newsPerPage = 6;
    const [pageCount, setPageCount] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedPage, setSelectedPage] = useState();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ? searchParams.get("search").split(',').join(' ') : "");

    const [selectDate, setSelectDate] = useState([{ name: "Дате (новые)", value: "desc" }, { name: "Дате (старые)", value: "asc" }]);

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.addEventListener("resize", (event) => setWindowWidth(window.innerWidth));
    })

    //Получаем количество созданных новостей
    useEffect(() => {
        let path = "/news/count";

        if (searchParams.get("search")) { //по поиску
            path += `?query=${searchParams.get("search")}`;
        }

        axios
            .get(path)
            .then((response) => {
                setNewsCount(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    });

    //Когда newsCount изменится с null на количество созданных новостей
    useEffect(() => {
        setPageCount(Math.ceil(newsCount / newsPerPage));
    }, [newsCount]);

    useEffect(() => {
        if(pageCount == 0){
            setSelectedPage(1);
        }
        else if (searchParams.get("page")) {
            if (searchParams.get("page") < 1) {
                setSelectedPage(1);
            }
            else if (searchParams.get("page") > pageCount) {
                setSelectedPage(pageCount);
            }
            else setSelectedPage(searchParams.get("page"))
        }
        else {
            setSelectedPage(1);
        }
    }, [pageCount]);


    useEffect(() => {

        if(!selectedPage){
            return;
        }

        let query = searchParams.get("search") ? `&query=${searchParams.get("search")}` : "";
        let sort = searchParams.get("sort") ? `&sort=${searchParams.get("sort")}` : "&sort=desc";

        axios
            .get("/news?page=" + (selectedPage < 1 || !selectedPage ? 1 : selectedPage) + "&limit=" + newsPerPage + query + sort)
            .then((response) => {
                setAllNews(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [selectedPage]);

    const goToNews = (e) => {
        window.location.assign("/new?newsId=" + e.target.dataset.id)
    }

    const changeLocation = (page, query, sort) => {
        let location = '?';

        if (page == null && searchParams.get("page")) {
            location += `page=${searchParams.get("page")}&`;
        }
        else if (page != null) {
            location += `page=${page}&`;
        }

        if (query == null && searchParams.get("search")) {
            location += `search=${searchParams.get("search")}&`;
        }
        else if (query != null) {
            location += `search=${query}&`;
        }

        if (sort == null && searchParams.get("sort")) {
            location += `sort=${searchParams.get("sort")}`;
        }
        else if (sort != null) {
            location += `sort=${sort}`;
        }

        window.location.assign(window.location.pathname + location);
    }


    //перейти на выбранный номер пагинации
    const handlePaginationClick = (e) => {
        changeLocation(parseInt(e.target.dataset.page), null, null);
    }

    //Перейти на предыдущую страничку
    const handlePrevPageClick = () => {
        changeLocation(parseInt(selectedPage) - 1, null, null);
    }

    //Перейти на следующую страничку
    const handleNextPageClick = () => {
        changeLocation(parseInt(selectedPage) + 1, null, null);
    }

    //Перейти на первую страничку
    const handleFirstPageClick = () => {
        changeLocation(1, null, null);
    }

    //Перейти на последнюю страничку
    const handleLastPageClick = () => {
        changeLocation(pageCount, null, null);
    }

    //изменить сортировку по дате 
    const handleDateChange = (e) => {
        const index = selectDate.findIndex(select => select.name === e.target.value)
        changeLocation(1, null, selectDate[index].value);
    }

    //Нажатие на кнопку поиска
    const handleSearch = (e) => {
        if ((!searchQuery || searchQuery === "") && !searchParams.get("search")) return;

        else if (searchParams.get("search") && searchQuery === "") {
            changeLocation(1, null, null);
        }

        let queryLines = searchQuery.split(' ');

        changeLocation(1, queryLines.join(',').replace(',,', ','), null);
    }

    //При вводе в поисковую строку меняем переменную
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    }

    //Элемент пагинации (цифра 1, 2, 3 и тд)
    const getPaginationItem = (i, currentPage) => {
        if (i + 1 == currentPage) {
            return <Pagination.Item key={i} active data-page={(i + 1)} className='paginationItemStyle me-1'>{i + 1}</Pagination.Item>;
        }
        else {
            return <Pagination.Item key={i} data-page={(i + 1)} onClick={handlePaginationClick} className='paginationItemStyle me-1'>{i + 1}</Pagination.Item>;
        }
    }

    // Первый элемент пагинации (1 и ...)
    const getFirstPaginationItems = (content) => {
        content.push(<Pagination.Item key={"firstpage"} data-page={1} onClick={handlePaginationClick} className='paginationItemStyle me-1'>1</Pagination.Item>);
        content.push(<Pagination.Item key={"firstdots"} disabled className='paginationItemStyle me-1'>...</Pagination.Item>);
    }

    // Первый элемент пагинации (... и номер последней страницы)
    const getLastPaginationItems = (content) => {
        content.push(<Pagination.Item key={"lastdots"} disabled className='paginationItemStyle me-1'>...</Pagination.Item>);
        content.push(<Pagination.Item key={"lastpage"} data-page={pageCount} onClick={handlePaginationClick} className='paginationItemStyle me-1'>{pageCount}</Pagination.Item>);
    }

    //Подготовка массива с элементами для последующего отображения пагинации
    const getPaginationItems = () => {
        let content = [];

        let currentPage = parseInt(selectedPage);

        if (currentPage != 1) {
            content.push(<Pagination.First key={"first"} onClick={handleFirstPageClick} className='paginationItemStyle me-1' />);
            content.push(<Pagination.Prev key={"prev"} onClick={handlePrevPageClick} className='paginationItemStyle me-1' />);
        }

        if (pageCount <= 9) {
            for (let i = 0; i < pageCount; i++) {
                content.push(getPaginationItem(i, currentPage));
            }
        }
        else if (currentPage - 3 <= 2) {
            for (let i = 0; i < 7; i++) {
                content.push(getPaginationItem(i, currentPage));
            }

            getLastPaginationItems(content);
        }
        else if (currentPage + 3 > pageCount - 2) {
            getFirstPaginationItems(content);
            for (let i = pageCount - 7; i < pageCount; i++) {
                content.push(getPaginationItem(i, currentPage));
            }
        }

        else {
            getFirstPaginationItems(content);
            for (let i = currentPage - 3; i < currentPage + 2; i++) {
                content.push(getPaginationItem(i, currentPage));
            }
            getLastPaginationItems(content);
        }

        if (currentPage != pageCount && pageCount != 0) {
            content.push(<Pagination.Next key={"next"} onClick={handleNextPageClick} className='paginationItemStyle me-1' />);
            content.push(<Pagination.Last key={"last"} onClick={handleLastPageClick} className='paginationItemStyle' />);
        }

        return content;
    }

    //Подготовка массива с элементами для последующего отображения пагинации
    const getPaginationItemsForPhone = () => {
        let content = [];

        let currentPage = parseInt(selectedPage);

        if (currentPage != 1) {
            content.push(<Pagination.First key={"first"} onClick={handleFirstPageClick} className='paginationItemStyle me-1' />);
            content.push(<Pagination.Prev key={"prev"}  onClick={handlePrevPageClick} className='paginationItemStyle me-1' />);
        }

        content.push(<Pagination.Item key={"selectedpage"} data-page={selectedPage} active className='paginationItemStyle me-1'>{selectedPage}</Pagination.Item>);

        if (currentPage != pageCount) {
            content.push(<Pagination.Next key={"next"}  onClick={handleNextPageClick} className='paginationItemStyle me-1' />);
            content.push(<Pagination.Last key={"last"}  onClick={handleLastPageClick} className='paginationItemStyle' />);
        }

        return content;
    }

    const getDate = (news) => {
        const months = {
            1: 31,
            2: 28,
            3: 31,
            4: 30,
            5: 31,
            6: 30,
            7: 31,
            8: 31,
            9: 30,
            10: 31,
            11: 30,
            12: 31
        }

        let hour = parseInt(news.creationDateTime.substring(11, 13)) + 3;
        let minute = parseInt(news.creationDateTime.substring(14, 16));
        let day = parseInt(news.creationDateTime.substring(8, 10));
        let month = parseInt(news.creationDateTime.substring(5, 7));
        let year = parseInt(news.creationDateTime.substring(0, 4));

        if (hour >= 24) {
            hour = hour - 24;

            day++;

            if (day > months[month]) {
                console.log(news);
                console.log(months[month]);
                if (month == 2 && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0)) {
                    day = 29;
                }
                else {
                    month++;
                    day = 1;
                }

                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
        }

        return `${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute} | ${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year < 10 ? '0' + year : year}`;
    }

    const handleClearSearch = (e) => {
        setSearchQuery("");
    }

    return (
        <>
            <Container className='cont-news mt-0 px-0 pb-4' fluid>

            <Container className='mt-2 d-flex justify-content-center' >
                <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title mb-0'>НОВОСТИ ДОСААФ КОСТРОМА</p>
            </Container>
                <Container fluid className='p-4 mt-4 cnt-search shadow'>
                    <Container fluid className='d-flex p-0'>
                        <InputGroup className='me-4'>
                            <Form.Control onChange={handleSearchChange} value={searchQuery} placeholder="Поиск новости" className='search-new-input'/>
                            {searchQuery ? <i className="bi bi-x input-group-text" style={{cursor: 'pointer'}} onClick={handleClearSearch}></i> : ""}
                        </InputGroup>
                        <Button className='px-3 btn-search' onClick={handleSearch}><i className='bi bi-search pe-none'></i></Button>
                    </Container>
                    <hr className='hrsearch'></hr>
                    <Container fluid className='d-flex justify-content-start'>
                        <p className='my-auto me-3 sort-by-title'>Сортировать по: </p>
                        <Form.Select className='select-sort' onChange={handleDateChange}>
                            {selectDate.map((select, i) => (
                                <option key={i} selected={select.value === searchParams.get("sort")}>{select.name}</option>
                            ))}
                        </Form.Select>
                    </Container>
                </Container>
                {loading ?
                    <Container fluid className='d-flex justify-center'>
                        <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                    </Container>
                :
                    <Row xs={1} lg={2}>
                        {allNews && allNews.length > 0 ? allNews.map((news) => (
                            <Col className='p-0' key={news.id}>
                                <Container fluid className='d-flex justify-content-center mt-4' >
                                    <Container fluid className='new-card shadow p-5 mx-0 d-flex flex-column shadow'>
                                        <Container fluid className='cnt-title-news p-0'>
                                            <p className='news-title'>{news.title}</p>
                                        </Container>
                                        <p className='text-secondary fw-light news-date-publication'>{getDate(news)}</p>

                                        {news.pictures && news.pictures.length > 0 ?

                                            <div className="p-1">
                                                <Image
                                                    src={news.pictures.filter(picture => picture.mainPicture)[0].pictureLink}
                                                    width="100%"
                                                    className='mx-auto d-block format-new-photo'
                                                    alt='Logo'
                                                />
                                            </div>
                                            : ""
                                        }

                                        {news.pictures && news.pictures.length > 0 ?

                                            <p className='mt-2 text-break news-content-text-with-photo' style={{ whiteSpace: "pre-line" }}>{news.content.length > 150 ? news.content.substring(0, 250) + "..." : news.content}</p>
                                            :
                                            <p className='mt-2 text-break news-content-text-no-photo' style={{ whiteSpace: "pre-line" }}>{news.content.length > 900 ? news.content.substring(0, 900) + "..." : news.content}</p>
                                        }
                                        <Button className='btn-go-to-new mt-auto' onClick={goToNews} data-id={news.id}>Узнать больше</Button>
                                    </Container>
                                </Container>
                            </Col>
                        )) : <p className='mx-auto text-center mt-5'>Новостей не найдено</p>}
                    </Row>
                }
                
                {!loading ? 
                    <Pagination className='d-flex justify-content-center mt-5'>
                        {allNews ?
                            windowWidth < 550 ?
                                getPaginationItemsForPhone()
                                :
                                getPaginationItems()
                            : ""}
                    </Pagination>
                    
                : ""}

                {
                    windowWidth < 550 && allNews && !loading ?
                        <p className='text-center'>Показана страница {selectedPage} из {pageCount}</p>
                        :
                        ""
                }
                
            </Container>
            <Routes>
                <Route exact path='/new' Component={New} />
            </Routes>
        </>
    );
}

export default News;

