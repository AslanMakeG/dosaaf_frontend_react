import React from 'react';
import '../styles/create_test_admin.css';
import '../styles/titles-sizes.css';
import { Container, Button } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Form } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Compon_breadcrumps from '../components/Compon_breadcumps';

function Create_test_admin(props) {
    const [CreateQuestion, SetCreateQuestion] = useState(false);

    const [testData, setTestData] = useState({ name: "", questions: [] })

    const [creationQuestionData, setCreationQuestionData] = useState({ name: "", questionType: "TYPE_SIMPLE" }); 
    const [errors, setErrors] = useState({ name: "", questions: [], creation: "" })

    const [isAdmin, setIsAdmin] = useState(false);

    const links = [
        { url: '/panel_admin', title: 'Панель администратора' },
        { url: '/testing_admin', title: 'Тесты' },
        { url: '/create_admin_test', title: 'Создание теста' }
    ];

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

    const handleChangeTestName = (e) => { //создание имени теста
        setTestData({ ...testData, name: e.target.value });
        setErrors(prevState => ({ ...prevState, name: "" }))
    }

    const handleSelectType = (e) => {//создание типа вопроса
        setCreationQuestionData({ ...creationQuestionData, questionType: e.target.value });
    }

    const handleCreationQuestionName = (e) => { //создание имени вопроса
        setCreationQuestionData({ ...creationQuestionData, name: e.target.value });
    }

    const handleAddQuestion = (e) => { //добавление вопроса 
        const updatedTest = testData;

        if (creationQuestionData.questionType != "TYPE_TEXT") {
            updatedTest.questions.push({
                ...creationQuestionData, answers: [
                    {
                        name: "",
                        rightAnswer: true
                    },
                    {
                        name: "",
                        rightAnswer: false
                    }
                ]
            })
        }
        else {
            updatedTest.questions.push({
                ...creationQuestionData, answers: [
                    {
                        name: "",
                        rightAnswer: true
                    }
                ]
            })
        }

        const questionErrors = [...errors.questions];

        questionErrors.push("");

        setErrors({ ...errors, questions: questionErrors })

        setTestData(updatedTest);
        setCreationQuestionData({ name: "", questionType: "TYPE_SIMPLE" });
        SetCreateQuestion(false);
    }

    const handleAddAnswer = (e) => {
        const question = [...testData.questions];

        question[e.target.dataset.index].answers.push({
            name: "",
            rightAnswer: false
        });

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    const handleDeleteQuestion = (e) => {
        const question = [...testData.questions];

        question.splice(e.target.dataset.index, 1);

        const questionErrors = [...errors.questions];

        questionErrors.splice(e.target.dataset.index, 1);
        setErrors({ ...errors, questions: questionErrors });

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    const handleDeleteAnswer = (e) => {
        const question = [...testData.questions];

        let isBeenRight = question[e.target.dataset.index].answers[e.target.dataset.answer].rightAnswer;

        question[e.target.dataset.index].answers.splice(e.target.dataset.answer, 1);

        //Если это вопрос с одиночным выбором, то устанавливаем правильным вставший на его место вопрос
        if (isBeenRight) {
            question[e.target.dataset.index].answers[e.target.dataset.answer].rightAnswer = true;
        }

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    const handleChangeQuestionName = (e) => { //изменение имени вопроса

        const question = [...testData.questions];

        question[e.target.dataset.index].name = e.target.value;

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    const handleChangeAnswerName = (e) => { //изменение ответа
        const question = [...testData.questions];

        question[e.target.dataset.index].answers[e.target.dataset.answer].name = e.target.value;

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    //изменение правильного ответа у множественного вопроса
    const handleMultipleAnswerRightChange = (e) => {
        const question = [...testData.questions];

        question[e.target.dataset.index].answers[e.target.dataset.answer].rightAnswer = e.target.checked;

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    //изменение правильного ответа у одиночного вопроса
    const handleSimpleAnswerRightChange = (e) => {
        const question = [...testData.questions];

        const indexPrev = question[e.target.dataset.index].answers.findIndex(answer => answer.rightAnswer);

        question[e.target.dataset.index].answers[indexPrev].rightAnswer = false; //прошлый поставить неправильным
        question[e.target.dataset.index].answers[e.target.dataset.answer].rightAnswer = e.target.checked; //выбранный поставить правильным

        const updatedTestData = {
            ...testData,
            questions: question
        };

        setTestData(updatedTestData);
    }

    const validate = (e) => {
        let noErrors = true;

        if (!testData.name) {
            setErrors(prevState => ({ ...prevState, name: "Название теста не должно быть пустым" }))
            noErrors = false;
        }
        else if (testData.name.length > 250) {
            setErrors(prevState => ({ ...prevState, name: "Название теста не должно быть длинее 250 символов" }))
            noErrors = false;
        }

        if (testData.questions.length == 0) {
            setErrors(prevState => ({ ...prevState, creation: "Добавьте хотя бы один вопрос" }))
            noErrors = false;
        }
        else {
            setErrors(prevState => ({ ...prevState, creation: "" }))
        }

        testData.questions.forEach((question, i) => {
            const questionErrors = [...errors.questions];
            let checkForMultiple = false; //для проверки, что хотя бы один из ответов в множественном вопросе помечен
            let checkError = false;

            question.answers.forEach((answer, j) => {
                if (answer.rightAnswer && question.questionType == "TYPE_MULTIPLE") {
                    checkForMultiple = true;
                }

                if (!answer.name) {
                    questionErrors[i] = "Заполните все названия ответов"
                    noErrors = false;
                    checkError = true;
                    setErrors(prevState => ({ ...prevState, questions: questionErrors }))
                }
                else if (answer.name.length > 250) {
                    questionErrors[i] = "Название ответа не должно быть длинее 250 символов (ответ №" + (j + 1) + ")"
                    noErrors = false;
                    checkError = true;
                    setErrors(prevState => ({ ...prevState, questions: questionErrors }))
                }
            })

            if (!checkError) {
                questionErrors[i] = "" //Если не было ошибки в вариантах ответа
                setErrors(prevState => ({ ...prevState, questions: questionErrors }));
            }

            if (!checkForMultiple && question.questionType == "TYPE_MULTIPLE") {
                questionErrors[i] = "Отметьте хотя бы один ответ, который будет правильным"
                noErrors = false;
                setErrors(prevState => ({ ...prevState, questions: questionErrors }))
                return;
            }

            if (!question.name) {
                console.log(12111111111)
                questionErrors[i] = "Название вопроса не должно быть пустым"
                setErrors(prevState => ({ ...prevState, questions: questionErrors }))
                noErrors = false;
                return;
            }
            else if (question.name.length > 250) {
                questionErrors[i] = "Название вопроса не должно быть длинее 250 символов"
                setErrors(prevState => ({ ...prevState, questions: questionErrors }))
                noErrors = false;
                return;
            }
        })

        return noErrors;
    }

    const handleSaveTest = (e) => { //создание теста
        if (!validate()) {
            return;
        }

        axios
            .post("/test", testData, {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            })
            .then((response) => {
                window.location.assign("testing_admin");
            })
            .catch((error) => {
                console.log(error);
            });
    }

    if (isAdmin) {
        return (
            <>
                <Container fluid className='main-cnt-create-test-admin p-0'>
                    <p className='text-center mt-2 main-section-title mb-1'>ПАНЕЛЬ АДМИНИСТРАТОРА</p>
                    <Container className=' d-flex justify-content-center' fluid>
                        <p className='text-secondary border-bottom border-primary border-opacity-50 text-center title-subsection'>Управление тестами</p>
                    </Container>
                    <Row className='mt-3'>
                        <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                        <Col xs={9} sm={9} md={7} lg={9}>

                            <Compon_breadcrumps links={links} />
                            <Container className='p-0' fluid>
                                <p className='d-flex align-items-center m-0 title-admin-add'>Создание теста</p>
                                <Form.Control type='text' placeholder='Введите наименование теста' name="name" onChange={handleChangeTestName} className='create-test-name-admin-input shadow-sm mt-4' />
                                <p className='mx-1 my-1 text-danger'>{errors.name}</p>
                                <p className='d-flex align-items-center m-0 title-admin-add mt-4'>Вопросы</p>
                                {testData.questions && testData.questions.length > 0 ?
                                    testData.questions.map((question, i) => (
                                        question.questionType == "TYPE_SIMPLE" ?
                                            <Container fluid className='card-question-admin-single-choice p-4 rounded mt-3 shadow-sm'>
                                                <Container className='d-flex justify-content-end p-0'>
                                                    <Button className='btn-delete-question-admin shadow-sm ms-2 d-flex justify-content-center align-items-center' data-index={i} onClick={handleDeleteQuestion}><i class="bi bi-trash3 icon_disabled"></i></Button>
                                                </Container>
                                                <p className='m-0 titles-question-card-admin'>Наименование вопроса:</p>
                                                <Form.Control type='text' placeholder='Введите наименование вопроса' defaultValue={question.name} name="name" onChange={handleChangeQuestionName} data-index={i} className='create-test-name-question-admin-input shadow-sm mt-1' />
                                                <p className='m-0 titles-question-card-admin mt-2'>Тип вопроса:</p>
                                                <p className='m-0 name-question-card-admin'>Одиночный выбор</p>
                                                <Form>
                                                    <Form.Group className="mb-3 mt-4 form-variant-answers">
                                                        <Form.Label className='text-secondary name-variant-answers'>Варианты ответов</Form.Label>
                                                        {question.answers.length > 0 ?
                                                            question.answers.map((answer, answerIndex) => (
                                                                <Container fluid className='d-flex p-0 align-items-center mt-1'>
                                                                    <Form.Check
                                                                        onChange={handleSimpleAnswerRightChange}
                                                                        data-index={i}
                                                                        data-answer={answerIndex}
                                                                        inline
                                                                        defaultChecked={answer.rightAnswer}
                                                                        type="radio"
                                                                        name="Items" />
                                                                    <Form.Control type='text' placeholder='Введите наименование вопроса' name="name" value={answer.name} data-index={i} data-answer={answerIndex} onChange={handleChangeAnswerName} className='create-test-name-admin-input shadow-sm' />
                                                                    {question.answers.length > 2 ?
                                                                        <Button className='btn-delete-question-variant shadow-sm ms-2 d-flex justify-content-center align-items-center' data-index={i} data-answer={answerIndex} onClick={handleDeleteAnswer}>
                                                                            <p className='text-del-variant-answer m-0' style={{ pointerEvents: 'none' }}>Удалить</p>
                                                                            <i class="bi bi-trash3 icon-del-variant-answer" style={{ pointerEvents: 'none' }}></i></Button>
                                                                        : ""}
                                                                </Container>
                                                            ))
                                                            : ""}
                                                        <Container className='d-flex justify-content-start p-0 mt-4 cnt-btn-plus-question' fluid>
                                                            <Button className='btn-plus-question fw-light d-flex justify-content-center align-items-center' data-index={i} onClick={handleAddAnswer}><i className='bi bi-plus icon_disabled'></i></Button>
                                                            <p className='text-secondary ms-3 d-block mt-auto my-auto name-variant-answers'>Добавить вариант ответа</p>
                                                        </Container>
                                                        <p className='mx-1 my-1 text-danger'>{errors.questions[i]}</p>
                                                    </Form.Group>
                                                </Form>
                                            </Container>

                                            : question.questionType == "TYPE_MULTIPLE" ?
                                                <Container fluid className='card-question-admin-multiple-choice p-4 rounded mt-3 shadow-sm'>
                                                    <Container className='d-flex justify-content-end p-0'>
                                                        <Button className='btn-delete-question-admin shadow-sm ms-2 d-flex justify-content-center align-items-center' data-index={i} onClick={handleDeleteQuestion} ><i class="bi bi-trash3 icon_disabled"></i></Button>
                                                    </Container>
                                                    <p className='m-0 titles-question-card-admin'>Наименование вопроса:</p>
                                                    <Form.Control type='text' placeholder='Введите наименование вопроса' name="name" defaultValue={question.name} onChange={handleChangeQuestionName} data-index={i} className='create-test-name-question-admin-input shadow-sm mt-1' />
                                                    <p className='m-0 titles-question-card-admin mt-2'>Тип вопроса:</p>
                                                    <p className='m-0 name-question-card-admin'>Множественный выбор</p>
                                                    <Form>
                                                        <Form.Group className="mb-3 mt-4 form-variant-answers">
                                                            <Form.Label className='text-secondary name-variant-answers'>Варианты ответов</Form.Label>
                                                            {question.answers.length > 0 ?
                                                                question.answers.map((answer, answerIndex) => (
                                                                    <Container fluid className='d-flex p-0 align-items-center mt-1'>
                                                                        <Form.Check
                                                                            onChange={handleMultipleAnswerRightChange}
                                                                            data-index={i}
                                                                            data-answer={answerIndex}
                                                                            inline
                                                                            defaultChecked={answer.rightAnswer}
                                                                            type="checkbox"
                                                                            name="Items" />
                                                                        <Form.Control type='text' placeholder='Введите наименование ответа' value={answer.name} data-index={i} data-answer={answerIndex} onChange={handleChangeAnswerName} name="name" className='create-test-name-admin-input shadow-sm' />
                                                                        {question.answers.length > 2 ?
                                                                            <Button className='btn-delete-question-variant shadow-sm ms-2 d-flex justify-content-center align-items-center' data-index={i} data-answer={answerIndex} onClick={handleDeleteAnswer}>
                                                                                <p className='text-del-variant-answer m-0' style={{ pointerEvents: 'none' }}>Удалить</p>
                                                                                <i class="bi bi-trash3 icon-del-variant-answer" style={{ pointerEvents: 'none' }}></i></Button>
                                                                            : ""}
                                                                    </Container>
                                                                ))
                                                                : ""}
                                                            <Container className='d-flex justify-content-start p-0 mt-4 cnt-btn-plus-question' fluid>
                                                                <Button className='btn-plus-question fw-light d-flex justify-content-center align-items-center' data-index={i} onClick={handleAddAnswer}><i className='bi bi-plus icon_disabled'></i></Button>
                                                                <p className='text-secondary ms-3 d-block mt-auto my-auto name-variant-answers'>Добавить вариант ответа</p>
                                                            </Container>
                                                            <p className='mx-1 my-1 text-danger'>{errors.questions[i]}</p>
                                                        </Form.Group>
                                                    </Form>
                                                </Container>
                                                :
                                                <Container fluid className='card-question-admin-text-reply p-4 rounded mt-3 shadow-sm'>
                                                    <Container className='d-flex justify-content-end p-0'>
                                                        <Button className='btn-delete-question-admin shadow-sm ms-2 d-flex justify-content-center align-items-center' data-index={i} onClick={handleDeleteQuestion}><i class="bi bi-trash3 icon_disabled"></i></Button>
                                                    </Container>
                                                    <p className='m-0 titles-question-card-admin'>Наименование вопроса:</p>
                                                    <Form.Control type='text' placeholder='Введите наименование вопроса' defaultValue={question.name} name="name" onChange={handleChangeQuestionName} data-index={i} className='create-test-name-question-admin-input shadow-sm mt-1' />
                                                    <p className='m-0 titles-question-card-admin mt-2'>Тип вопроса:</p>
                                                    <p className='m-0 name-question-card-admin'>Текстовый ответ</p>
                                                    <Form>
                                                        <Form.Group className="mb-3 mt-2 form-variant-answers">
                                                            <Form.Label className='text-secondary name-variant-answers'>Ответ</Form.Label>

                                                            <Form.Control type='text' placeholder='Введите правильный ответ на вопрос' name="name" data-index={i} data-answer={0} onChange={handleChangeAnswerName} className='create-test-name-admin-input shadow-sm' />

                                                        </Form.Group>
                                                    </Form>
                                                    <p className='mx-1 my-0 text-danger'>{errors.questions[i]}</p>
                                                </Container>
                                    ))
                                    : ""}

                                <Container className='d-flex justify-content-start p-0 mt-4 cnt-btn-plus-question' fluid>
                                    <Button className='btn-plus-question fw-light d-flex justify-content-center align-items-center' onClick={() => SetCreateQuestion(true)}><i className='bi bi-plus icon_disabled'></i></Button>
                                    <p className='text-secondary ms-3 d-block mt-auto my-auto name-variant-answers'>Добавить вопрос</p>
                                </Container>
                                <p className='mx-1 mt-1 text-danger'>{errors.creation}</p>
                                <Button className='btn-save-test-admin' onClick={handleSaveTest}>Сохранить тест</Button>
                            </Container>
                        </Col>
                    </Row>
                </Container>

                <Modal
                    show={CreateQuestion}
                    onHide={() => SetCreateQuestion(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title className='title-create-question-modal'>
                            Создание тестового вопроса
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Control type='text' placeholder='Введите наименование вопроса' name="name"
                                onChange={handleCreationQuestionName}
                                className='create-question-name-admin-input shadow-sm' />
                            <Container fluid className='d-flex justify-content-between align-items-center p-0 mt-3'>
                                <p className='title-type-question m-0'>Тип вопроса</p>
                                <Form.Select onChange={handleSelectType} className='select-type-question shadow-sm'>
                                    <option value="TYPE_SIMPLE">Одиночный выбор</option>
                                    <option value="TYPE_MULTIPLE">Множественный выбор</option>
                                    <option value="TYPE_TEXT">Текстовый ответ</option>
                                </Form.Select>
                            </Container>
                            <Button className='mt-3 btn-create-question' onClick={handleAddQuestion}>Сохранить</Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default Create_test_admin;