let config = {

	containerColorBG: "#353336",
	contentColorBG: "#525053",

	countRows: 6,
	countCols: 7,

	offsetBorder: 10,
	borderRadius: 8,
		
	gemSize: 64,

	imagesCoin: ["images/coin/coin_1.png", "images/coin/coin_2.png", "images/coin/coin_3.png", "images/coin/coin_4.png", "images/coin/coin_5.png", "images/coin/coin_6.png", "images/coin/coin_7.png", "images/coin/coin_8.png"],

	gemClass:"gem",
	gemIdPrefix: "gem",
	gameStates: ["pick", "switch", "revert", "remove", "refill"],
	gameState: "",
	
	movingItems: 0,

	countScore: 0
}

let player = {
	selectedRow: -1,
	selectedCol: -1,
	posX: "",
	posY: ""
}

let components = {
	container: document.createElement( "div" ),
	content: document.createElement( "div" ),
	wrapper: document.createElement( "div" ),
	cursor: document.createElement( "div" ),
	score: document.createElement( "div" ),
	gems: new Array(),
}






// start Game
initGame();

// Инициализация всех составляющих игры
function initGame () {
	document.body.style.margin = "0px";
	createPage();
	createContentPage();
	createWrapper();
	createCursor();
	createGrid();
	createScore();

	// Переключаем статус игры на "выбор"
	config.gameState = config.gameStates[ 0 ];
}

// Создание обертки для страницы
function createPage() {
	components.container.style.backgroundColor = config.containerColorBG;
	components.container.style.height = "100vh";
	components.container.style.overflow = "hidden";
	components.container.style.display = "flex";
	components.container.style.alignItems = "center";
	components.container.style.justifyContent = "center";

	document.body.append( components.container );
}

// Создание обертки с контентом
function createContentPage () {
	components.content.style.padding = config.offsetBorder + "px";
	components.content.style.width = 	(config.gemSize * config.countCols) + 
										(config.offsetBorder * 2) + "px";
	components.content.style.height = 	(config.gemSize * config.countRows) +
										(config.offsetBorder * 2) + "px";
	components.content.style.backgroundColor = config.contentColorBG;
	components.content.style.boxShadow = config.offsetBorder + "px";
	components.content.style.borderRadius = config.borderRadius + "px";
	components.content.style.boxSizing = "border-box";

	components.container.append( components.content );
}

// Создание обертки для монет и очков
function createWrapper () {
	components.wrapper.style.position = "relative";
	components.wrapper.style.height = "100%";
	components.wrapper.addEventListener("click", function(event) { handlerTab(event, event.target) });

	components.content.append( components.wrapper );
}

// Создание курсора для выделения монет
function createCursor () {
	components.cursor.id = "marker";
	components.cursor.style.width = config.gemSize - 10 + "px";
	components.cursor.style.height = config.gemSize - 10 + "px";
	components.cursor.style.border = "5px solid white";
	components.cursor.style.borderRadius = "20px";
	components.cursor.style.position = "absolute";
	components.cursor.style.display = "none";

	components.wrapper.append( components.cursor );
}
// Показать курсор
function cursorShow () {
	components.cursor.style.display = "block";
}
// Скрыть курсор
function cursorHide () {
	components.cursor.style.display = "none";
}

// Создание блока для очков
function createScore () {
	components.score.style.width = 200 + "px";
	components.score.style.height = 50 + "px";
	components.score.style.display = "flex";
	components.score.style.justifyContent = "center";
	components.score.style.alignItems = "center";
	components.score.style.borderRadius = config.borderRadius + "px";
	components.score.style.backgroundColor = config.contentColorBG;
	components.score.style.position = "absolute";
	components.score.style.bottom = "calc(100% + " + 24 + "px)";
	components.score.style.left = "calc(50% - " + ( parseInt(components.score.style.width) / 2) + "px)";

	components.score.style.fontFamily = "sans-serif";
	components.score.style.fontSize = "16px";
	components.score.style.color = "#ffffff";
	

	updateScore();
}

// Обновить очки на странице
function updateScore () {
	components.score.innerHTML = config.countScore;
	components.wrapper.append( components.score );
}

// Добавление очков
function scoreInc ( count ) {
	if ( count >= 4 ) {
		count *= 2;
	} else if ( count >= 5 ) {
		count = ( count + 1 ) * 2;
	} else if ( count >= 6 ) {
		count *= ( count + 2 ) * 2;
	}

	config.countScore += count;
	updateScore();
}

// Создание монеты
function createGem ( t, l, row, col, img ) {
	let coin = document.createElement("div");

	coin.classList.add( config.gemClass );
	coin.id = config.gemIdPrefix + '_' + row + '_' + col;
	coin.style.boxSizing = "border-box";
	coin.style.cursor = "pointer";
	coin.style.position = "absolute";
	coin.style.top = t + "px";
	coin.style.left = l + "px";
	coin.style.width = config.gemSize + "px";
	coin.style.height = config.gemSize + "px";
	coin.style.border = "1p solid transparent";
	coin.style.backgroundImage = "url("+ img +")";
	coin.style.backgroundSize = "100%";

	components.wrapper.append( coin );
}

// Создание и наполнение сетки для монет
function createGrid() {
	// Создание пустой сетки
	for(i = 0; i < config.countRows; i++) {
		components.gems[i] = new Array();
		for(j = 0; j < config.countCols; j++) {
			components.gems[i][j] = -1;
		}
	}

	// Заполняем сетку
	for( i = 0; i < config.countRows; i++ ) {
		for( j = 0; j < config.countCols; j++ ) {

			do{
				components.gems[i][j] = Math.floor(Math.random() * 8);
			} while( isStreak(i, j) );

			createGem( i * config.gemSize, j * config.gemSize, i, j, config.imagesCoin[ components.gems[i][j] ] );
		}
	}
}

// Проверка на группу сбора
function isStreak( row, col ) {
	return isVerticalStreak( row, col ) || isHorizontalStreak( row, col );
}
// Проверка на группу сбора по колонкам
function isVerticalStreak( row, col ) {
	let gemValue = components.gems[row][col];
	let streak = 0;
	let tmp = row;

	while(tmp > 0 && components.gems[tmp - 1][col] == gemValue){
		streak++;
		tmp--;
	}

	tmp = row;

	while(tmp < config.countRows - 1 && components.gems[tmp + 1][col] == gemValue){
		streak++;
		tmp++;
	}

	return streak > 1;
}
// Проверка на группу сбора по строкам
function isHorizontalStreak( row, col ) {
	let gemValue = components.gems[row][col];
	let streak = 0;
	let tmp = col;

	while(tmp > 0 && components.gems[row][tmp - 1] == gemValue){
		streak++;
		tmp--;
	}

	tmp = col;

	while(tmp < config.countCols - 1 && components.gems[row][tmp + 1] == gemValue){
		streak++;
		tmp++;
	}

	return streak > 1;
}

// Обработчик клика
function handlerTab ( event, target ) {
	// Если это элемент с классом config.gameClass
	// и
	// Если подходящее состояние игры
	if( target.classList.contains( config.gemClass ) && config.gameStates[ 0 ]) {
		// определить строку и столбец
		let row = parseInt( target.getAttribute( "id" ).split( "_" )[ 1 ] );
		let col =  parseInt( target.getAttribute( "id" ).split( "_" )[ 2 ] );

		// Выделяем гем курсором
		cursorShow();
		components.cursor.style.top = parseInt( target.style.top ) + "px";
		components.cursor.style.left = parseInt( target.style.left ) + "px";

		// Если это первый выбор, то сохраняем выбор
		if( player.selectedRow == -1 ) {
			player.selectedRow = row;
			player.selectedCol = col;
		} else {
			// Если гем находится радом с первым выбором
			// то меняем их местами
			if ( ( Math.abs( player.selectedRow - row ) == 1 && player.selectedCol == col ) ||
				( Math.abs( player.selectedCol - col ) == 1 && player.selectedRow == row ) ){
					cursorHide();

					// После выбора меняем состояние игры
					config.gameState = config.gameStates[1];

					// сохранить позицию второго выбранного гема
					player.posX = col;
					player.posY = row;

					// поменять их местами
					gemSwitch();
			} else {
				// Если второй выбор произошел не рядом,
				// то делаем его первым выбором.
				player.selectedRow = row;
				player.selectedCol = col;
			}
		}
	}
}

// Меняем гемы местами
function gemSwitch () {
	let yOffset = player.selectedRow - player.posY;
	let xOffset = player.selectedCol - player.posX;

	// Метка для гемов, которые нужно двигать
	document.querySelector("#" + config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).classList.add("switch");
	document.querySelector("#" + config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("dir", "-1");

	document.querySelector("#" + config.gemIdPrefix + "_" + player.posY + "_" + player.posX).classList.add("switch");
	document.querySelector("#" + config.gemIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("dir", "1");

	// меняем местами гемы
	$( ".switch" ).each( function() {
		config.movingItems++;

		$(this).animate( {
				left: "+=" + xOffset * config.gemSize * $(this).attr("dir"),
				top: "+=" + yOffset * config.gemSize * $(this).attr("dir")
			},
			{
				duration: 250,
				complete: function() {
					//Проверяем доступность данного хода
					checkMoving();
				}
			}
		);

		$(this).removeClass("switch");
	});
	

	// поменять идентификаторы гемов
	document.querySelector("#" + config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol).setAttribute("id", "temp");
	document.querySelector("#" + config.gemIdPrefix + "_" + player.posY + "_" + player.posX).setAttribute("id", config.gemIdPrefix + "_" + player.selectedRow + "_" + player.selectedCol);
	document.querySelector("#temp").setAttribute("id",  config.gemIdPrefix + "_" + player.posY + "_" + player.posX);

	// поменять гемы в сетке
	let temp = components.gems[player.selectedRow][player.selectedCol];
	components.gems[player.selectedRow][player.selectedCol] = components.gems[player.posY][player.posX];
	components.gems[player.posY][player.posX] = temp;
}

// Проверка перемещенных гемов
function checkMoving () {
	config.movingItems--;

	// Действуем тольпо после всех перемещений
	if( config.movingItems == 0 ) {

		// Действия в зависимости от состояния игры
		switch( config.gameState ) {

			// После передвижения гемов проверяем на появление групп сбора
			case config.gameStates[1]:
			case config.gameStates[2]:
				// проверяем, появились ли группы сбора
				if( !isStreak( player.selectedRow, player.selectedCol ) && !isStreak( player.posY, player.posX ) ) {
					// Если групп сбора нет, нужно отменить совершенное движение
					// а если действие уже отменяется, то вернуться к исходному состоянию ожидания выбора
					if( config.gameState != config.gameStates[2] ){
						config.gameState = config.gameStates[2];
						gemSwitch();
					} else {
						config.gameState = config.gameStates[0];
						player.selectedRow = -1;
						player.selectedCol = -1;
					}
				} else {
					// Если группы сбора есть, нужно их удалить
					config.gameState = config.gameStates[3]

					// Отметим все удаляемые гемы
					if( isStreak( player.selectedRow, player.selectedCol ) ) {
						removeGems( player.selectedRow, player.selectedCol );
					}

					if(isStreak(player.posY, player.posX)) {
						removeGems( player.posY, player.posX );
					}

					// Убираем с поля
					gemFade();
				}
				break;
			// После удаления нужно заполнить пустоту
			case config.gameStates[3]:
				checkFalling();
				break;
			case config.gameStates[4]:
				placeNewGems();
				break;
		}

	}

}

// Отмечаем элементы для удаления и убираем их из сетки
function removeGems( row, col ) {
	let gemValue = components.gems[ row ][ col ];
	let tmp = row;

	document.querySelector( "#" + config.gemIdPrefix + "_" + row + "_" + col ).classList.add( "remove" );
	let countRemoveGem = document.querySelectorAll( ".remove" ).length;

	if ( isVerticalStreak( row, col ) ) {
		while ( tmp > 0 && components.gems[ tmp - 1 ][ col ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + ( tmp - 1 ) + "_" + col ).classList.add( "remove" );
			components.gems[ tmp - 1 ][ col ] = -1;
			tmp--;
			countRemoveGem++;
		}

		tmp = row;

		while ( tmp < config.countRows - 1 && components.gems[ tmp + 1 ][ col ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + ( tmp + 1 ) + "_" + col ).classList.add( "remove" );
			components.gems[ tmp + 1 ][ col ] = -1;
			tmp++;
			countRemoveGem++;
		}
	}

	if ( isHorizontalStreak( row, col ) ) {
		tmp = col;

		while ( tmp > 0 && components.gems[ row ][ tmp - 1 ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + row + "_" + ( tmp - 1 ) ).classList.add( "remove" );
			components.gems[ row ][ tmp - 1 ] = -1;
			tmp--;
			countRemoveGem++;
		}

		tmp = col;

		while( tmp < config.countCols - 1 && components.gems[ row ][ tmp + 1 ] == gemValue ) {
			document.querySelector( "#" + config.gemIdPrefix + "_" + row + "_" + ( tmp + 1 ) ).classList.add( "remove" );
			components.gems[ row ][ tmp + 1 ] = -1;
			tmp++;
			countRemoveGem++;
		}
	}

	components.gems[ row ][ col ] = -1;

	scoreInc( countRemoveGem );
}

// Удаляем гемы
function gemFade() {
	$( ".remove" ).each(function() {
		config.movingItems++;

		$(this).animate( {
				opacity: 0
			},
			{
				duration: 200,
				complete: function() {
					$(this).remove();
					checkMoving();
				}
			}
		);
	});
}

// Заполняем пустоту
function checkFalling() {
	let fellDown = 0;

	for( j = 0; j < config.countCols; j++ ) {
		for( i = config.countRows - 1; i > 0; i-- ) {

			if(components.gems[i][j] == -1 && components.gems[i - 1][j] >= 0) {
				document.querySelector( "#" + config.gemIdPrefix + "_" + (i - 1) + "_" + j ).classList.add( "fall" );
				document.querySelector( "#" + config.gemIdPrefix + "_" + (i - 1) + "_" + j ).setAttribute( "id", config.gemIdPrefix + "_" + i + "_" + j );
				components.gems[ i ][ j ] = components.gems[ i - 1 ][ j ];
				components.gems[ i - 1 ][ j ] = -1;
				fellDown++;
			}

		}
	}

	$( ".fall" ).each( function() {
		config.movingItems++;

		$( this ).animate( {
				top: "+=" + config.gemSize
			},
			{
				duration: 100,
				complete: function() {
					$( this ).removeClass( "fall" );
					checkMoving();
				}
			}
		);
	});

	// Если все элементы передвинули,
	// то сменить состояние игры
	if( fellDown == 0 ){
		config.gameState = config.gameStates[4];
		config.movingItems = 1;
		checkMoving();
	}
}


// Создание новых гемов
function placeNewGems() {
	let gemsPlaced = 0;

	// Поиск мест, в которых необходимо создать гем
	for( i = 0; i < config.countCols; i++ ) {
		if( components.gems[ 0 ][ i ] == -1 ) {
			components.gems[ 0 ][ i ] = Math.floor( Math.random() * 8 );
			
			createGem( 0, i * config.gemSize, 0, i, config.imagesCoin[ components.gems[ 0 ][ i ] ] );
			gemsPlaced++;
		}
	}

	// Если мы создали гемы, то проверяем необходимость их сдвинуть вниз.
	if( gemsPlaced ) {
		config.gameState = config.gameStates[ 3 ];
		checkFalling();
	} else {
		// Проверка на группы сбора
		let combo = 0

		for ( i = 0; i < config.countRows; i++ ) {
			for ( j = 0; j < config.countCols; j++ ) {

				if ( j <= config.countCols - 3 && components.gems[ i ][ j ] == components.gems[ i ][ j + 1 ] && components.gems[ i ][ j ] == components.gems[ i ][ j + 2 ] ) {
					combo++;
					removeGems( i, j );
				}
				if ( i <= config.countRows - 3 && components.gems[ i ][ j ] == components.gems[ i + 1 ][ j ] && components.gems[ i] [ j ] == components.gems[ i + 2 ][ j ] ) {
					combo++;
					removeGems( i, j );
				}

			}
		}

		// удаляем найденные группы сбора
		if( combo > 0 ) {
			config.gameState = config.gameStates[ 3 ];
			gemFade();
		} else { 
			// Запускаем основное состояние игры
			config.gameState = config.gameStates[ 0 ];
			player.selectedRow= -1;
		}
	}
}