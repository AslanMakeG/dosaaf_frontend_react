import React from 'react';
import { Container, Button } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import '../styles/test_passing.css';
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';


function Test_passing(props) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [testData, setTestData] = useState(null);

    const [testPass, setTestPass] = useState(null);

    const [isEnd, setIsEnd] = useState(false);

    useEffect(() => {
        if(localStorage.getItem("token")){
            axios.get('/user', {
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem("token")
                }
            }).then((response) => {
                setIsAuthorized(true);
            })
            .catch((error) => {
                window.location.assign("login");
            });
        }
        else{
            window.location.assign("login");
        }
    }, [])

    useEffect(() => {
        axios.get("/test/" + searchParams.get("id"), {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setTestData(response.data);
        })
        .catch((error) => {
            console.log(error);
        })
    }, [])

    useEffect(() => { //каждому вопросу добавили его id из test data
        if(!testData) return;

        let questions = [];
        testData.questions.forEach(question => {
            questions.push({
                id: question.id
            })
        });
        setTestPass({id: testData.id, questions: [...questions]})
    }, [testData])

    const handleChangeSimpleAnswer = (e) => {//изменение ответа у вопроса одиночного выбора
        const index = testPass.questions.findIndex(question => question.id == e.target.dataset.question)

        const questions = [...testPass.questions];
        
        const updatedQuestion = {// 1 id ответа
            ...questions[index],
            answersId: [e.target.dataset.answer]
        };

        questions[index] = updatedQuestion;

        setTestPass({
            ...testPass,
            questions: questions
        });
    }

    const handleChangeMultipleAnswer = (e) => {//изменение ответа у множественного выбора

        const index = testPass.questions.findIndex(question => question.id == e.target.dataset.question)

        const questions = [...testPass.questions];
        
        let updatedQuestion = questions[index];

        if(e.target.checked){
            if(updatedQuestion.answersId && updatedQuestion.answersId.length > 0){ //засовываем ответ в массив ответов
                const answers = updatedQuestion.answersId;
                answers.push(e.target.dataset.answer);
                updatedQuestion = {
                    ...questions[index],
                    answersId: answers
                };
            }
            else if(!updatedQuestion.answersId){ //если нет ни одного ответа, то формируем новый массив
                updatedQuestion = {
                    ...questions[index],
                    answersId: [e.target.dataset.answer]
                };
            }
        }
        else{
            updatedQuestion = { //удаляем ответ из массива когда убрали галочку
                ...questions[index],
                answersId: updatedQuestion.answersId.filter(answer => answer != e.target.dataset.answer)
            };
        }

        questions[index] = updatedQuestion;

        setTestPass({
            ...testPass,
            questions: questions
        });
    }

    const handlePassTest = (e) => { //при нажатии на кнопку отправить
        axios.post("/test/pass", testPass, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem("token")
            }
        }).then((response) => {
            setTestPass(response.data); //для каждого вопроса становится правильно ли ответили
            setIsEnd(true); //когда тест окончен
        })
        .catch((error) => {
            console.log(error);
        })
    }

    if(isAuthorized){
        return (
            <Container fluid className='main-ctn-twst-passing p-0'>
                <Container className='mt-2 d-flex justify-content-center' >
                    <p className='border-bottom p-2 border-primary border-opacity-50 main-section-title'>ТРЕНИРОВОЧНЫЕ ТЕСТЫ</p>
                </Container>
                <Row className='mt-3'>
                    <Col xs={3} sm={3} md={5} lg={3}><Sidebar /></Col>
                    <Col xs={9} sm={9} md={7} lg={9}>
                        <p className='m-0 test-passing-name-test'>{testData ? testData.name : ""}</p>

                        <p className='mb-0 mt-2 all-count-question-title'>Вопросов: {testData ? testData.questions.length : ""}</p>

                        {testData ? testData.questions.map((question, i) => (
                            <Container fluid className='p-4 test-passing-question shadow-sm rounded ms-0 mt-3'>
                                <p className='text-secondary m-0 title-question-number'>Вопрос {i + 1}</p>
                                <p className='mb-0 mt-3 test-passing-name-question'>{question.name}</p>
                                <p className='text-secondary mb-0 mt-3 count-select-answers-title'>
                                {question.questionType == "TYPE_SIMPLE" ? "Выберите один вариант ответа" :
                                question.questionType == "TYPE_MULTIPLE" ? "Выберите один или несколько вариантов ответа" :
                                "Напишите верный ответ"
                                }
                                </p>

                                {question.questionType == "TYPE_SIMPLE" ?
                                    question.answers.map((answer) => (
                                        <Container fluid className='d-flex p-2 mt-2 test-passion-variant-answer shadow-sm ms-0'>
                                            <Form.Check className='m-0 d-flex align-items-center'
                                                onChange={handleChangeSimpleAnswer}
                                                data-question={question.id}
                                                data-answer={answer.id}
                                                disabled={isEnd}
                                                type="radio"
                                                name={"items" + i}
                                            />
                                            <p className='my-auto ms-3 test-passing-variant-answer'>{answer.name}</p>
                                        </Container>
                                    ))
                                : question.questionType == "TYPE_MULTIPLE" ? 
                                        question.answers.map((answer) => (
                                            <Container fluid className='d-flex p-2 mt-2 test-passion-variant-answer shadow-sm ms-0'>
                                                <Form.Check className='m-0 d-flex align-items-center'
                                                    onChange={handleChangeMultipleAnswer}
                                                    data-question={question.id}
                                                    data-answer={answer.id}
                                                    disabled={isEnd}
                                                    type="checkbox"
                                                    name="Items"
                                                />
                                                <p className='my-auto ms-3 test-passing-variant-answer'>{answer.name}</p>
                                            </Container>
                                        )) 
                                : 
                                <Form.Control disabled={isEnd} type='text' placeholder='Ответ:' className='test-passing-text-input shadow-sm mt-2' />}
                                {isEnd ? 
                                    testPass.questions[testPass.questions.findIndex(questionPass => questionPass.id == question.id)].right ?
                                        <Container fluid className='p-0 d-flex align-items-center mt-3'>
                                            <i class="bi bi-check correct-answer-icon"></i>
                                            <p className='mb-0 correct-answer-text fw-bold'>Ответ верный</p>
                                        </Container>
                                    :                              
                                        <Container fluid className='p-0 d-flex align-items-center mt-3'>
                                            <i class="bi bi-x no-correct-answer-icon"></i>
                                            <p className='mb-0 no-correct-answer-text fw-bold'>Ответ не верный</p>
                                        </Container>
                                : ""}
                            </Container>
                        )) 
                        : ""}

                        {isEnd ?
                            <Button className='btn-finish-test-attempt mt-4 d-flex align-items-center justify-content-center'
                            href='testing'
                            >Обратно к тестам</Button>
                        :
                            <Button className='btn-finish-test-attempt mt-4 d-flex align-items-center justify-content-center'
                            onClick={handlePassTest}
                            >Завершить прохождение</Button>}
                    </Col>

                </Row>
            </Container>
        );
    }
}

export default Test_passing;