import { Link, useParams, useLocation, useSearchParams, useNavigate } from "react-router";
import { useEffect, useState, useCallback, useRef, Fragment } from "react";
import React from "react";
import { useImmer } from "use-immer";

const style = <style>{`
.account-block {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 10px;
	transition: background-color 0.2s;
}

.account-block:hover {
	background-color: var(--selectedColor);
}

.account-block .info {
	display: flex;
	flex-direction: column;
}

.account-block .info .name {
	font-weight: 500;
}

.account-block .info .description {
	font-size: 0.9em;
	color: var(--buttonsAndTextSecondaryColor);
	opacity: 0.8;
}

.search-page #sort form {
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
	align-items: flex-start;
}
.search-page .radio-select {
	display: flex;
	flex-direction: column;
	gap: 5px;
}
.search-page .radio {
	display: flex;
	align-items: center;
	gap: 5px;
}

.search-page #header #mainheader {
	display: flex;
	align-items: center;
	justify-content: space-around;
	padding: 10px;
}

.search-page #header #sort form {
	display: flex;
	align-content: center;
	align-items: center;
	justify-content: space-around;
	padding: 10px;
}

@media (max-width: 700px) {
	.search-page #header #mainheader {
		padding: 0;
	}
	.search-page #header #sort form {
		padding: 0;
		flex-direction: column;
	}
}
`}</style>;

function SearchPage() {
    // Получаем параметры из URL
    const [searchParams, setSearchParams] = useSearchParams();
    const query = decodeURIComponent( searchParams.get('query') || '' );
    const type = searchParams.get('type') || 'all';
    const sort = searchParams.get('sort') || '0';
    
    // Состояния компонента
    const [results, setResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const loaderRef = useRef(null); // Для отслеживания элемента-загрузчика

    // Функция для загрузки данных
    const fetchResults = useCallback(async (pageNum, currentQuery, currentType, currentSort, isNewSearch) => {
        if (!currentQuery) return;
        setIsLoading(true);
        setError(null);

        try {
            const params = { text: currentQuery, sort: currentSort, page: pageNum };
            if (currentType !== 'all') {
                params.parse = currentType;
            }
            const response = await app.f.get('search', params);
            const newResults = response.content || [];

            if (isNewSearch) {
                setResults(newResults);
            } else {
                setResults(prev => [...prev, ...newResults]);
            }
            // Если API вернуло меньше, чем мы ожидаем на странице, или пустой массив, считаем что больше нет
            //setCanLoadMore(newResults.length > 0);
            
			setCanLoadMore(newResults.length >= app.globalPageSize);
        } catch (err) {
            console.error("Search error:", err);
            setError(app.translateError ? app.translateError('search_failed') : 'Search failed');
        } finally {
            setIsLoading(false);
        }
    }, []); // Зависимости убраны, так как они передаются как аргументы

    // Эффект для выполнения нового поиска при изменении параметров URL
    useEffect(() => {
        setResults([]); // Сбрасываем результаты
        setPage(1);     // Сбрасываем страницу
        setCanLoadMore(true); // Разрешаем загрузку снова
        fetchResults(1, query, type, sort, true); // Запускаем новый поиск
    }, [query, type, sort, fetchResults]);

    // Эффект для бесконечной прокрутки (Intersection Observer)
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && canLoadMore && !isLoading) {
                setPage(prevPage => {
                    const nextPage = prevPage + 1;
                    fetchResults(nextPage, query, type, sort, false);
                    return nextPage;
                });
            }
        }, { threshold: 1.0 });

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [canLoadMore, isLoading, fetchResults, query, type, sort]);


    // Обработчик изменения фильтров
    const handleFilterChange = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const newType = formData.get('include');
        const newSort = formData.get('sortby');
        
        // Обновляем параметры URL
        setSearchParams({ query, type: newType, sort: newSort });
    };

    const renderResultItem = (item) => {
        switch (item.object) {
            case 'posts':
                return <app.structures.Post post={item} canOpenFully key={`post-${item.id}`} />;
            case 'users':
                return <app.components.UserCard children={item} key={`user-${item.id}`} />;
			case 'mipuadv_posts':
				return <app.components.MipuAdvPostSearchCard children={item} key={`mipuadv-posts-${item.id}`} />;
            default:
                return (
                    <div key={`unknown-${item.id || Math.random()}`}>
                        #page.search.unknownobject#: {item.object}
                        <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                );
        }
    };

	
	const sorts = [
		["0", "#uncategorized.sorts.default#"],
		["1", "#uncategorized.sorts.new#"],
		["2", "#uncategorized.sorts.old#"],
		["3", "#uncategorized.sorts.popularity#"],
	];
	const includes = [
		["all", "#page.search.default#"],
		["users", "#page.search.includes.users#"],
		["posts", "#page.search.includes.posts#"],
	];

    return (
        <div className="search-page app-pg-simplecontent">
            <app.components.WebpageTitle>{`#page.search.title# "${query}"`}</app.components.WebpageTitle>
            
			{style}
			
            <div id="header" className="backgroundable-object-one">
                <div id="mainheader">
                    <span id="result">{isLoading && page === 1 ? '#uncategorized.loading#' : `#page.search.result#`.replace("&0&", results.length)}</span>
                    <button className="btn app-button" id="filtersearch" onClick={() => setShowFilters(prev => !prev)}>
                        #page.search.filter#
                    </button>
                </div>

                {showFilters && (
                    <div id="sort">
                        <form onSubmit={handleFilterChange}>
                            <div id="sortby" className="radio-select micro">
                                <a>#page.search.sort.index#</a>
                                {sorts.map(sortValue => {
                                    const id = `sort_` + sortValue[0];
                                    const labels = ['no', 'new', 'old', 'popularity'];
                                    return (
                                        <div className="radio" key={id}>
                                            <input name="sortby" value={sortValue[0]} type="radio" id={id} defaultChecked={sort === sortValue[0]} />
                                            <label htmlFor={id}>{sortValue[1]}</label>
                                        </div>
                                    );
                                })}
                            </div>
                            <div id="include" className="radio-select micro">
                                <a>#page.search.include.index#</a>
                                {includes.map(typeValue => {
                                    const id = `type_` + typeValue[0];
                                    return (
                                        <div className="radio" key={id}>
                                            <input name="include" value={typeValue[0]} type="radio" id={id} defaultChecked={type === typeValue[0]} />
											<label htmlFor={id}>{typeValue[1]}</label>
                                        </div>
                                    );
                                })}
                            </div>
                            <button type="submit" className="btn app-button">#button.submit#</button>
                        </form>
                    </div>
                )}
            </div>

            <div id="result-filler">
                {results.length > 0 ? (
                    results.map(renderResultItem)
                ) : (
                    !isLoading && <p>#page.search.notfound#</p>
                )}
            </div>
            
            {/* Элемент-загрузчик для Intersection Observer */}
            <div ref={loaderRef} style={{ height: '50px', textAlign: 'center' }}>
                {isLoading && page > 1 && <app.components.Loading />}
            </div>
            
            {error && <app.components.ErrorAlert>{error}</app.components.ErrorAlert>}
        </div>
    );
}

// Экспортируем компонент и путь
export const path = "/search";
export default SearchPage;