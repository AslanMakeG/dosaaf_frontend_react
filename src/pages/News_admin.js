import React from 'react';
import { Container, Button } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Sidebar from '../components/Sidebar';
import '../styles/news_admin.css';
import { Modal, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Image from 'react-bootstrap/Image';
import axios, { all } from 'axios';
import { DropdownButton } from 'react-bootstrap';
import { Dropdown } from 'react-bootstrap';

function News_admin(props) {
    const [ShowCreateNew, SetShowCrNew] = useState(false);
    const [ShowUpdateNew, SetShowUpdateNew] = useState(false);

    const [newsData, setNewsData] = useState({ title: "", content: "", albumLink: null, pictures: [] })
    const [allNews, setAllNews] = useState(null)

    const [ShowDeleteNews, SetShowDeleteNews] = useState(false);

    const [errors, setErrors] = useState({ title: "", content: "", albumLink: "", pictures: "" })

    const [isAdmin, setIsAdmin] = useState(false);

    const [searchString, setSearchString] = useState(""); //Строка, которая хранит введенную в поиск строку
    const [isSearch, setIsSearch] = useState(false); //Ставится true, при вводе в поиск по названию новостей
    const [searchedNews, setSearchedNews] = useState([]); //Найденные новости по слову в поиске

    const [groupsToNotify, setGroupsToNotify] = useState([]);
    const [allMailingGroups, setAllMailingGroups] = useState(null);

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

    const handleDeleteNews = (e) => { //Удаление новости
        SetShowDeleteNews(false);
        axios
            .delete("/news/" + newsData.id, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                SetShowDeleteNews(false);
                const item = allNews.filter(news => news.id != response.data);
                setAllNews(item);
            })
            .catch((error) => {
                console.log(error);
            });
        setNewsData({ title: "", content: "", albumLink: null, pictures: [] });
    }

    const handleShowDelete = (e) => { //Получение данных для удаление и показ модалки
        axios
            .get("/news/" + e.target.dataset.id)
            .then((response) => {
                setNewsData(response.data);
                SetShowDeleteNews(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    useEffect(() => { //Получение всех новостей
        axios
            .get("/news/all", {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setAllNews(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleChange = (event) => {
        setNewsData({ ...newsData, [event.target.name]: event.target.value });
        setErrors({ ...errors, [event.target.name]: "" });
    };

    const handleGetPictures = (e) => { //Получение фотографий по нажатию кнопки "Загрузить фото"
        if (!newsData.albumLink) {
            setErrors(prevState => ({ ...prevState, albumLink: "вставьте ссылку на альбом, прежде чем загружать фотографии" }))
            return;
        }

        setErrors(prevState => ({ ...prevState, albumLink: "" }))

        axios.get("/newspicture?albumLink=" + newsData.albumLink, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setNewsData(prevState => ({ ...prevState, pictures: response.data }));
        })
            .catch((error) => {
                setErrors(prevState => ({ ...prevState, albumLink: "не удалось получить фотографии с альбома" }));
                setNewsData(prevState => ({ ...prevState, pictures: [] }));
            });
    }

    const validate = () => {
        let noErrors = true;

        let r = new RegExp(/^https:[/]{2}vk.com[/]album[-]\d{1,}_\d{1,}$/);
        if (newsData.albumLink && !r.test(newsData.albumLink)) {
            setErrors(prevState => ({ ...prevState, albumLink: "неверная ссылка на альбом, пример: https://vk.com/album-12345678_123456789" }))
            noErrors = false;
        }
        else if (newsData.albumLink && newsData.pictures.length == 0) {
            setErrors(prevState => ({ ...prevState, albumLink: "нажмите кнопку загрузить фото, либо удалите ссылку на альбом" }))
            noErrors = false;
        }

        if (!newsData.title) {
            setErrors(prevState => ({ ...prevState, title: "заголовок не может быть пустым" }))
            noErrors = false;
        }
        else if (newsData.title.length > 200) {
            setErrors(prevState => ({ ...prevState, title: "длина заголовка не может быть больше, чем 200 символов" }))
            noErrors = false;
        }

        if (!newsData.content) {
            setErrors(prevState => ({ ...prevState, content: "содержание не может быть пустым" }))
            noErrors = false;
        }
        else if (newsData.content.length > 15000) {
            setErrors(prevState => ({ ...prevState, content: "длина содержания не может быть больше, чем 15000 символов" }))
            noErrors = false;
        }

        return noErrors;
    }

    const handleCreateNews = (e) => { //Создание новости
        if (!validate()) {
            return;
        }

        axios.post("/news", newsData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setAllNews(prevAllNews => [...prevAllNews, response.data]);
            SetShowCrNew(false);
            setNewsData({ title: "", content: "", albumLink: null, pictures: [] });

            axios.post("/news/notify/" + response.data.id, groupsToNotify, { //После создания новости оповещение пользователей, которые подписаны на рассылку
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                setGroupsToNotify([]);
            }).catch((error) => { console.log(error) });

        }).catch((error) => { console.log(error) });
    }

    const handleMainPictureChange = (e) => { //Изменение главной фотографии
        const news = newsData;

        let index = e.target.dataset.index; //Получаем индекс в массиве фотографии, которую будем ставить главной
        const indexPrev = news.pictures.findIndex(picture => picture.mainPicture); //Ищем текущую главную фотографию

        const prevPicture = { //Поставить прошлую главную новость на false
            ...news.pictures[indexPrev],
            mainPicture: false
        };

        const newPicture = { //Поставить выбранную новость на true (будет главной)
            ...news.pictures[index],
            mainPicture: true
        };

        news.pictures[indexPrev] = prevPicture;
        news.pictures[index] = newPicture;

        setNewsData(news);
    }

    const handleShowUpdate = (e) => { //Получение информации о новости и показ окна с обновлением
        axios
            .get("/news/" + e.target.dataset.id)
            .then((response) => {
                setNewsData(response.data);
                SetShowUpdateNew(true);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const handleUpdateNews = (e) => { //обновление новости
        if (!validate()) {
            return;
        }

        axios.put("/news", newsData, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {

            const updatedNews = response.data;

            const index = allNews.findIndex(news => news.id == updatedNews.id);

            const updatedAllNews = [...allNews];

            updatedAllNews[index] = updatedNews;

            setAllNews(updatedAllNews);
            SetShowUpdateNew(false);
            setNewsData({ title: "", content: "", albumLink: null, pictures: [] });

        }).catch((error) => { console.log(error) });
    }

    const handleDeletePicture = (e) => { //удаление новости
        let isMainPicture = false;

        const updatedNewsData = newsData;

        const index = e.target.dataset.index;

        if (updatedNewsData.pictures[index].mainPicture) {
            isMainPicture = true;
        }

        updatedNewsData.pictures.splice(index, 1);

        if (isMainPicture && updatedNewsData.pictures.length > 0) {
            updatedNewsData.pictures[index].mainPicture = true;
        }

        setNewsData({
            ...newsData,
            pictures: updatedNewsData.pictures
        });
    }

    const handleArchive = (e) => { //Перенос новости в архив
        axios.get("/news/archive/" + e.target.dataset.id, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            const updatedNews = response.data;
            const index = allNews.findIndex(news => news.id == updatedNews.id);

            if (index == -1) return;

            const updatedAllNews = [...allNews];
            updatedAllNews[index] = updatedNews;

            setAllNews(updatedAllNews);
        }).catch((error) => { console.log(error) });
    }

    const getDate = (news) => { //Преобразование даты и времени из строки 12.12.2023 15:00:31+3часа в 12.12.2023 18:00:31
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

        return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year < 10 ? '0' + year : year}`;
    }

    const handleSearch = (e) => { //изменение строки поиска новостей
        setSearchString(e.target.value);
    }

    useEffect(() => { //При изменении строки поиска нужно обновить найденные новости
        if (searchString) {
            setSearchedNews(allNews.filter(news => news.title.toLowerCase().indexOf(searchString.toLowerCase()) != -1));
            setIsSearch(true);
        }
        else { //если строка поиска пустая то найденные новости не нужны
            setSearchedNews([]);
            setIsSearch(false);
        }
    }, [searchString])

    useEffect(() => { //Если изменили или удалили новость то нужно провести поиск заново
        if (searchString) {
            setSearchedNews(allNews.filter(news => news.title.toLowerCase().indexOf(searchString.toLowerCase()) != -1));
            setIsSearch(true);
        }
        else {
            setSearchedNews([]);
            setIsSearch(false);
        }
    }, [allNews])

    useEffect(() => { //Получение всех групп рассылок
        axios
            .get("/mailing/all", {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                setAllMailingGroups(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const handleChangeGroups = (e) => {
        let updatedGroupsToNotify = groupsToNotify;

        if (e.target.checked) {
            updatedGroupsToNotify.push(e.target.dataset.id);
        }
        else {
            updatedGroupsToNotify = updatedGroupsToNotify.filter(group => group != e.target.dataset.id);
        }

        setGroupsToNotify(updatedGroupsToNotify);
    }

    if (isAdmin) {
        return (
            <>
                <Container fluid className='main-cnt-news-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className='d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление новостями</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>



                            <Container className='d-flex p-0' fluid>
                                <p className='d-flex align-items-center title-admin-add m-0'>Создать новость?</p>
                                <Button className='ms-4 btn-admin-add' onClick={() => SetShowCrNew(true)}>Создать</Button>
                            </Container>

                            <Form.Control type="text" placeholder='Поиск по названию новости' onChange={handleSearch} className='new-control-input shadow-sm mt-4' />

                            <Container className='mt-4 p-0' fluid>
                                <Row xs={1} lg={1} xl={2}>
                                    {loading ?
                                        <Container fluid className='d-flex justify-center mt-3'>
                                            <svg className="spinner align-self-center mt-4 mb-4 mx-auto" viewBox="0 0 50 50">
                                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                            </svg>
                                        </Container>
                                        : isSearch ?
                                            searchedNews && searchedNews.length > 0 ?searchedNews.map((news) => (
                                                <Col key={news.id}>
                                                    <Container className='admin-card-new px-5 py-4 mb-4 shadow rounded'>
                                                        <Container fluid className='cnt-admin-name-new p-0'>
                                                            <p className='mb-1 admin-name-new'><span className="fw-bold">Наименование:</span> {news.title}</p>
                                                        </Container>
                                                        <p className='mb-1 name-count-photo'><span className="fw-bold">Дата создания: </span>{getDate(news)}</p>
                                                        <p className='mb-3 name-count-photo'><span className="fw-bold">Фото: </span> {news.pictures.length} фотографий</p>
                                                        <div className='d-flex justify-content-between'>
                                                            <Button className='btn-admin-new-edit' data-id={news.id} onClick={handleShowUpdate}>Изменить</Button>
                                                            {news.inArchive ?
                                                                <Button className='btn-admin-new-archive' data-id={news.id} onClick={handleArchive}>Из архива</Button>
                                                                :
                                                                <Button className='btn-admin-new-archive' data-id={news.id} onClick={handleArchive}>В архив</Button>
                                                            }
                                                            <Button className='btn-admin-new-delete' data-id={news.id} onClick={handleShowDelete}>Удалить</Button>
                                                        </div>
                                                    </Container>

                                                </Col>
                                            )) : <p className='mx-auto text-center mt-5'>Новостей не найдено</p>
                                            :
                                            allNews && allNews.length > 0? allNews.map((news) => (
                                                <Col key={news.id}>
                                                    <Container className='admin-card-new px-5 py-4 mb-4 shadow rounded'>
                                                        <Container fluid className='cnt-admin-name-new p-0'>
                                                            <p className='mb-1 admin-name-new'><span className="fw-bold">Наименование:</span> {news.title}</p>
                                                        </Container>
                                                        <p className='mb-1 name-count-photo'><span className="fw-bold">Дата создания: </span>{getDate(news)}</p>
                                                        <p className='mb-3 name-count-photo'><span className="fw-bold">Фото: </span> {news.pictures.length} фотографий</p>
                                                        <div className='d-flex justify-content-between'>
                                                            <Button className='btn-admin-new-edit' data-id={news.id} onClick={handleShowUpdate}>Изменить</Button>
                                                            {news.inArchive ?
                                                                <Button className='btn-admin-new-archive' data-id={news.id} onClick={handleArchive}>Из архива</Button>
                                                                :
                                                                <Button className='btn-admin-new-archive' data-id={news.id} onClick={handleArchive}>В архив</Button>
                                                            }
                                                            <Button className='btn-admin-new-delete' data-id={news.id} onClick={handleShowDelete}>Удалить</Button>
                                                        </div>
                                                    </Container>

                                                </Col>
                                            )) : <p className='mx-auto text-center mt-5'>Новостей еще не создано</p>
                                    }
                                </Row>
                            </Container>
                        </Col>
                    </Row>
                </Container>

                <Modal
                    show={ShowCreateNew}
                    onHide={() => { setGroupsToNotify([]); SetShowCrNew(false); setErrors({ title: "", content: "", albumLink: "", pictures: "" }); setNewsData({ title: "", content: "", albumLink: null, pictures: [] }) }}
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title className='news-modal-title'>
                            Создание новости
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='pt-4'>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите название новости' name="title" onChange={handleChange} className='new-control-input shadow-sm' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.title}</Form.Label>
                                <Form.Control as="textarea" placeholder='Введите содержание новости' name="content" onChange={handleChange} className='new-description-input shadow-sm' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.content}</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        placeholder="Вставьте ссылку на альбом"
                                        className='shadow-sm new-control-input'
                                        name="albumLink"
                                        onChange={handleChange}
                                    />
                                    <Button className='btn-download-photo' id="button-addon2" onClick={handleGetPictures}>
                                        Загрузить фото
                                    </Button>
                                </InputGroup>
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.albumLink}</Form.Label>
                            </Form.Group>

                        </Form>
                        <Container fluid className='container-phonos-links scrollspy-example scrollspy-example' >
                            {newsData.pictures.length > 0 ? newsData.pictures.map((picture, i) => (
                                <Container className='link-photo-for-news d-flex mt-3  align-items-center text-wrap shadow-sm' key={picture.id}>
                                    {picture.mainPicture ?
                                        <Form.Check
                                            data-index={i}
                                            defaultChecked
                                            onChange={handleMainPictureChange}
                                            className='mx-1 d-flex align-items-center'
                                            type={'radio'}
                                            name="mainPicture"
                                        />
                                        :
                                        <Form.Check
                                            data-index={i}
                                            onChange={handleMainPictureChange}
                                            className='mx-1 d-flex align-items-center'
                                            type={'radio'}
                                            name="mainPicture"
                                        />
                                    }

                                    <div className="p-1"> <Image
                                        src={picture.pictureLink}
                                        className='mx-auto d-block photo-format'
                                        alt='Logo'
                                    /></div>
                                    <p className='p-2 d-flex align-items-center m-0 photo_number_new'>Фото {i + 1}</p>
                                    <Container className='cnt-for-link'>
                                        <a href={picture.pictureLink} target="_blank"><p className='p-2 d-flex align-items-center m-0 text-break link-to-photo'>{picture.pictureLink}</p></a>
                                    </Container>
                                    <Button className="ms-auto p-2 del-photo d-flex align-items-center justify-content-center m-0" data-index={i} onClick={handleDeletePicture}><i class="bi bi-x" style={{ pointerEvents: 'none' }}></i></Button>
                                </Container>
                            )) : <p className='mx-1 my-2'>Тут будут отображаться фото с альбома</p>}
                        </Container>

                        {allMailingGroups && allMailingGroups.length > 0 ?
                            <Container className='d-flex p-0'>
                                <Container className='w-50 me-auto'></Container>
                                <Dropdown className='mt-3'>
                                    <Dropdown.Toggle align='end' className='ms-auto' variant="primary" id="dropdown-basic">
                                        Разослать письмо группам
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu align='end' style={{ maxHeight: "150px", overflowY: "auto", }}>
                                        {allMailingGroups.map(group => (
                                            <Container key={group.id} className='d-flex'>
                                                <Form.Check
                                                    className='d-flex align-items-center p-0'
                                                    inline
                                                    defaultChecked={false}
                                                    data-id={group.id}
                                                    onChange={handleChangeGroups}
                                                    type="checkbox"
                                                    name="Items" />
                                                <Form.Label className='m-0 p-0'>{group.name}</Form.Label>
                                            </Container>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Container>
                            : ""}

                        <Button className="mt-3 mb-2 btn_form_new shadow-sm" onClick={handleCreateNews}>Сохранить</Button>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={ShowUpdateNew}
                    onHide={() => { SetShowUpdateNew(false); setErrors({ title: "", content: "", albumLink: "", pictures: "" }); setNewsData({ title: "", content: "", albumLink: null, pictures: [] }) }}
                    size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title className='news-modal-title'>
                            Изменение новости
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className='pt-4'>
                            <Form.Group controlId='NameChapter'>
                                <Form.Control type='text' placeholder='Введите название новости' name="title" defaultValue={newsData.title} onChange={handleChange} className='new-control-input shadow-sm' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.title}</Form.Label>
                                <Form.Control as="textarea" placeholder='Введите содержание новости' name="content" defaultValue={newsData.content} onChange={handleChange} className='new-description-input shadow-sm' />
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.content}</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        defaultValue={newsData.albumLink}
                                        placeholder="Вставьте ссылку на альбом"
                                        className='new-control-input shadow-sm'
                                        name="albumLink"
                                        onChange={handleChange}
                                    />
                                    <Button className='btn-download-photo' id="button-addon2" onClick={handleGetPictures}>
                                        Загрузить фото
                                    </Button>
                                </InputGroup>
                                <Form.Label className='mb-3 mx-1 text-danger'>{errors.albumLink}</Form.Label>
                            </Form.Group>

                        </Form>
                        <Container fluid className='container-phonos-links scrollspy-example scrollspy-example' >
                            {newsData.pictures.length > 0 ? newsData.pictures.map((picture, i) => (
                                <Container className='link-photo-for-news d-flex mt-3  align-items-center text-wrap shadow-sm' key={picture.id}>
                                    {picture.mainPicture ?
                                        <Form.Check
                                            data-index={i}
                                            defaultChecked
                                            onChange={handleMainPictureChange}
                                            className='mx-1 r-button-main-photo d-flex align-items-center'
                                            type={'radio'}
                                            name="mainPicture"
                                        />
                                        :
                                        <Form.Check
                                            data-index={i}
                                            onChange={handleMainPictureChange}
                                            className='mx-1 d-flex align-items-center'
                                            type={'radio'}
                                            name="mainPicture"
                                        />
                                    }

                                    <div className="p-1"> <Image
                                        src={picture.pictureLink}
                                        height="50"
                                        width="50"
                                        className='mx-auto d-block photo-format'
                                        alt='Logo'
                                    /></div>
                                    <p className='p-2 d-flex align-items-center m-0 link-photo-number photo_number_new'>Фото {i + 1}</p>
                                    <Container className='cnt-for-link'>
                                        <a href={picture.pictureLink} target="_blank"><p className='p-2 d-flex align-items-center m-0 text-break link-to-photo'>{picture.pictureLink}</p></a>
                                    </Container>
                                    <Button className="ms-auto p-2 del-photo d-flex align-items-center justify-content-center m-0" data-index={i} onClick={handleDeletePicture}><i class="bi bi-x" style={{ pointerEvents: 'none' }}></i></Button>
                                </Container>
                            )) : <p className='mx-1 my-2'>Тут будут отображаться фото с альбома</p>}
                        </Container>
                        <Button className="mt-3 mb-2 btn_form_new" onClick={handleUpdateNews}>Сохранить</Button>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={ShowDeleteNews}
                    onHide={() => { SetShowDeleteNews(false); }}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Удаление
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <h5 className='fw-light'>Вы действительно хотите удалить новость <span className="fw-bold">{newsData.title}</span> с полной потерей данных?</h5>
                        <Button className="mt-3 mb-2 btn_delete_chapter-service " onClick={handleDeleteNews}>Удалить</Button>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default News_admin;