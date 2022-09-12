import { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { HttpMethod, useAjax } from "../hooks/useAjax";
import { screenScaleState } from "../store/common.store";
import styles from '../styles/meal.module.css';
import { dateToShortStr, shrotStrToDate } from "../utils/util";

enum MealTime {
    MORNING = '아침',
    LUNCH = '점심',
    DINNER = '저녁'
}

interface MealType {
    date: string,
    time?: MealTime,
    content: string
}

type MealRes = {
    [index in MealTime]: string | null;
};

const MealPage: NextPage = () => {
    const { ajax } = useAjax();
    const [mealList, setMealList] = useState<MealType[]>([]);
    const [renderMealList, setRenderMealList] = useState<MealType[]>([]);
    const [mealIdx, setMealIdx] = useState<number>(0);
    const [viewRange, setViewRange] = useState<number>(5);
    const [isSameDay, setIsSameDay] = useState<boolean>(false);
    const [screenScale] = useRecoilState(screenScaleState);

    // init
    useEffect(() => {
        (async () => {
            setMealList(await loadMealList(dateToShortStr(new Date)));
        })();
        window.addEventListener('resize', calcViewRange);
        return () => {
            window.removeEventListener('resize', calcViewRange);
        }
    }, []);

    useEffect(() => calcViewRange(), [screenScale])

    useEffect(() => {
        renderMeal();
    }, [mealList, mealIdx, viewRange]);

    const loadMealList = (date: string): Promise<MealType[]> => {
        return new Promise((resolve, reject) => {
            ajax<MealRes>({
                url: `meal/${date}`,
                method: HttpMethod.GET,
                callback(data) {
                    const tempMealList: MealType[] = [];
                    Object.entries(data).forEach(value => {
                        if (!value[1]) return;
                        tempMealList.push({
                            date,
                            time: Object.values(MealTime)[
                                Object.keys(MealTime).indexOf(value[0].toUpperCase())
                            ],
                            content: value[1]
                        });
                    });
                    resolve(tempMealList);
                },
                errorCallback(data) {
                    if (data && data.statusCode === 404) {
                        resolve([{
                            date,
                            content: '급식이 없습니다'
                        }]);
                        return true;
                    }
                    reject();
                },
            });
        })
    }

    const calcViewRange = () => {
        const screenWidth = (window.innerWidth / screenScale) * 100;
        let range = Math.floor(screenWidth / 250);
        if (range < 3) range = 3;
        if (range % 2 === 0) range++;
        setViewRange(range);
    }

    const renderMeal = async () => {
        if (!mealList.length) return;
        if (viewRange % 2 == 0) throw new Error('Even range is not available');

        const offset = Math.floor(viewRange / 2);

        const loadPromises: {
            prev?: Promise<MealType[]>,
            next?: Promise<MealType[]>
        } = {};
        let loadFlag = false;
        
        const tempMealList: MealType[] = [];
        // 렌더링될 급식 리스트 가져오기
        [...Array(viewRange).keys()].forEach(i => {
            if (mealList[mealIdx - offset + i]) {
                tempMealList.push(mealList[mealIdx - offset + i]);
            }
            else {
                loadFlag = true;
                // 이전, 다음 급식 불러오기
                if (offset > i) {
                    if (loadPromises.prev) return;
                    const nextDate = mealList[mealIdx - offset + i + 1]?.date;
                    if (!nextDate) return;

                    const prevDate = shrotStrToDate(nextDate);
                    prevDate.setDate(
                        shrotStrToDate(nextDate).getDate() - 1
                    );
                    
                    loadPromises.prev = loadMealList(dateToShortStr(prevDate));
                } else {
                    if (loadPromises.next) return;
                    const prevDate = mealList[mealIdx - offset + i - 1]?.date;
                    if (!prevDate) return;

                    const nextDate = shrotStrToDate(prevDate);
                    nextDate.setDate(
                        shrotStrToDate(prevDate).getDate() + 1
                    );

                    loadPromises.next = loadMealList(dateToShortStr(nextDate));
                }
            }
        });
        if (loadFlag) {
            const [prevMeals, nextMeals] = await Promise.all([
                loadPromises.prev?? [],
                loadPromises.next?? []
            ]);

            setMealList(prev => [...prevMeals, ...prev, ...nextMeals]);
            if (prevMeals.length) {
                setMealIdx(prev => prev + prevMeals.length);
            }
            return;
        };

        // 전부 같은 날인지 확인
        tempMealList.some((meal, i) => {
            if (tempMealList[0].date !== meal.date) {
                setIsSameDay(false);
                return true;
            }
            if (i === tempMealList.length-1) {
                setIsSameDay(true);
                return false;
            }
        });

        setRenderMealList(tempMealList);
    }

    const checkShowMealDate = (meal: MealType, i: number): boolean => {
        const next = renderMealList[i+1];
        if (i == 0 && next?.date === meal.date) {
            return false;
        }
        const prev = renderMealList[i-1];
        if ((i == renderMealList.length-1) && prev?.date === meal.date) {
            return false;
        }
        if (prev?.date === meal.date && next?.date === meal.date) {
            return false;
        }
        return true;
    }

    const dateColor = (date: string): number => {
        const year = Number(date.substring(0, 2));
        const month = Number(date.substring(2, 4));
        const day = Number(date.substring(4, 6));

        return (((year * 100) + (month * 10) + day) % 4);
    }

    return (
        <div>
            <div className="container">
                <Head>
                    <title>급식 - BSM</title>
                </Head>
                <div className="title center">
                    <h1>급식</h1>
                </div>
                <div className={styles.meals_wrap}>
                    <ul className={styles.meals}>
                        {
                            renderMealList.map((meal, i) => {
                                const middleIdx = Math.floor((renderMealList.length) / 2);
                                return (
                                    <li 
                                        key={`${meal.date}${meal.time}`}
                                        onClick={() => {
                                            if (middleIdx > i) {
                                                setMealIdx(prev => prev - ((middleIdx) - i));
                                            } else if (middleIdx < i) {
                                                setMealIdx(prev => prev - ((middleIdx) - i));
                                            }
                                        }}
                                        className={`${middleIdx === i? styles.center: ''} ${styles[`date_color_${dateColor(meal.date)}`]}`}
                                    >
                                        <div>
                                            {(
                                                (isSameDay && middleIdx === i) || (!isSameDay && checkShowMealDate(meal, i))
                                            ) && (
                                                <h3 className={styles.date}>
                                                    {meal.date}
                                                </h3>
                                            )}
                                            <h3>{meal.time}</h3>
                                            <div className={styles.content}>
                                                {
                                                    meal.content.split('  ').map(content => <p key={content}>{content}</p>)
                                                }
                                            </div>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default MealPage;