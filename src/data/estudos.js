/* ============================================================
   Estudos Doutrinários — Evangelho Quadrangular (os Quatro Rostos)
   Conteúdo separado dos componentes. Para adicionar um novo estudo
   (Leão, Boi, Águia...), basta criar um objeto com o mesmo formato
   e registrá-lo em ESTUDOS.
   Referências bíblicas são marcadas com [[...]] para destaque.
   ============================================================ */

export const ESTUDOS = [
    {
        id: "face-de-homem",
        titulo: "Face de Homem",
        tituloDestaque: "FACE DE HOMEM",
        subtitulo: "Jesus Cristo, o Salvador",
        accent: "#C8102E",

        versiculoChave: {
            ref: "João 1:14",
            texto: "O Verbo se fez carne, e habitou entre nós, e vimos a sua glória, como a glória do unigênito do Pai, cheio de graça e de verdade.",
        },

        introducao: [
            {
                tipo: "versiculo",
                lead: "Lemos em [[João 1:14]]:",
                ref: "João 1:14",
                texto: "O Verbo se fez carne, e habitou entre nós, e vimos a sua glória, como a glória do unigênito do Pai, cheio de graça e de verdade.",
            },
            {
                tipo: "p",
                texto: "Precisava Jesus, para salvar o homem, tornar-se homem, isto é, encarnar-se no ventre de Maria, para participar de nossa natureza e raça, como semente da mulher, cumprindo [[Gênesis 3:15]], com os propósitos de:",
            },
            {
                tipo: "lista",
                itens: [
                    "conhecer nossos problemas, nossas doenças, nossas dores e nossas ansiedades;",
                    "sentir, por nós, compaixão ([[Filipenses 2:7]]; [[Hebreus 2:17,18]]; [[4:15]]; [[5:1,2]]);",
                    "mas, de modo especial, nos salvar.",
                ],
            },
            {
                tipo: "p",
                texto: "Para nos salvar, necessitava de ter corpo para oferecê-lo como sacrifício pelos pecados dos homens. Precisava também ser homem de dores ([[Hebreus 10:10]]), sofrendo em lugar dos homens, na cruz e fora da cruz: trabalhos ([[Isaías 53:3]]); necessidades físicas (canseira, fome, calor, frio, sono, fraqueza etc.). Precisava conhecer experimentalmente e enfrentar nossos problemas morais e espirituais, inclusive enfrentar e derrotar Satanás. Precisava padecer, por nós, dores, pesares, revoltas, tristezas, decepções, solidão, ingratidões e ansiedades. Precisava, como homem, em lugar dos pecadores, ser ridicularizado, rejeitado, humilhado, preso, espancado, cuspido, injuriado, flagelado, confundido com malfeitores, xingado, zombado, julgado, desafiado, condenado, crucificado e morto fisicamente. Mas o homem perfeito, ideal, santo, irrepreensível e modelo para todas as criaturas humanas, para ser o Salvador justo (que justificou a muitos), em lugar do homem, com o propósito de salvá-lo da perdição eterna.",
            },
            {
                tipo: "p",
                texto: "Jesus Cristo como Salvador é tipificado no “ROSTO DE HOMEM”. Temos o seguinte esboço para o estudo desta doutrina:",
            },
        ],

        esboco: [
            { letra: "A", titulo: "O “Rosto de Homem”: Jesus Cristo, o Salvador", alvo: "comentario-a" },
            { letra: "B", titulo: "Evangelho: Lucas", alvo: "comentario-b" },
            { letra: "C", titulo: "Como apresenta Jesus: “Filho do Homem”", alvo: "comentario-c" },
            { letra: "D", titulo: "Símbolo da Salvação: Cruz", alvo: "comentario-d" },
            { letra: "E", titulo: "Cor simbólica na bandeira: Escarlate (vermelha)", alvo: "comentario-e" },
        ],

        comentario: [
            {
                id: "comentario-a",
                letra: "A",
                titulo: "O Rosto de Homem: Jesus Cristo, o Salvador",
                blocos: [
                    {
                        tipo: "p",
                        texto: "O primeiro rosto que Ezequiel viu foi o “ROSTO DE HOMEM”, apresentando “Jesus Cristo, o Filho do Homem, como Salvador”, que foi sacrificado por nós. Todos necessitamos desse Salvador, porque todos pecamos ([[Rom 3:23]]). É necessário crer NELE ([[Atos 16:31]]) para nascer de novo ([[João 3:3]]) e ter o nome escrito no livro da vida ([[Apoc 20:15]]). Para sermos salvos, Cristo morreu por todos e ressuscitou ([[Rom 8:34]]). Ele intercede por nós ([[Heb 7:25]]), defende-nos ([[I João 2:1-2]]) e liberta-nos do pecado e da morte ([[Rom 8:2]]). Jesus Cristo, o Salvador, é nosso Cordeiro da Páscoa ([[I Cor 5:7]]); como o povo de Israel no Egito foi protegido da morte pelo sangue de um cordeiro sacrificado, assim Jesus nos protege da morte eterna pelo Seu Sangue e nos garante a salvação ([[Ex 12:1-7]]; [[I João 2:2]]). Este é o primeiro aspecto do Evangelho Quadrangular.",
                    },
                ],
            },
            {
                id: "comentario-b",
                letra: "B",
                titulo: "Evangelho de Lucas",
                blocos: [
                    {
                        tipo: "p",
                        texto: "O Evangelho de Lucas apresenta Jesus Cristo, o “SALVADOR”, que “veio buscar e salvar o que se havia perdido” ([[Lucas 19:10]]).",
                    },
                ],
            },
            {
                id: "comentario-c",
                letra: "C",
                titulo: "Jesus como “Filho do Homem”",
                blocos: [
                    {
                        tipo: "p",
                        texto: "Lucas apresenta o Salvador Jesus Cristo como “FILHO DO HOMEM”, perfeito e ideal no corpo, na alma e no espírito. Este evangelho foi escrito especialmente para os gregos, cujo ideal era o homem perfeito.",
                    },
                    {
                        tipo: "p",
                        texto: "Quem é o “FILHO DO HOMEM”? O “FILHO DO HOMEM” é o “FILHO DE DEUS”. Em [[João 1:1]] lemos:",
                    },
                    {
                        tipo: "versiculo",
                        ref: "João 1:1",
                        texto: "No princípio era o Verbo, e o Verbo estava com Deus, e o Verbo era Deus.",
                    },
                    {
                        tipo: "p",
                        texto: "Continuando, a Escritura declara em [[João 1:14]] que",
                    },
                    {
                        tipo: "versiculo",
                        ref: "João 1:14",
                        texto: "...o Verbo se fez carne, e habitou entre nós, e vimos a sua glória, como a glória do unigênito do Pai, cheio de graça e de verdade.",
                    },
                    {
                        tipo: "p",
                        texto: "[[I Tim 3:16]] explica:",
                    },
                    {
                        tipo: "versiculo",
                        ref: "I Tim 3:16",
                        texto: "E sem dúvida alguma, grande é o mistério da piedade: aquele que se manifestou na carne, foi justificado em espírito, visto dos anjos, pregado aos gentios, crido no mundo, e recebido em cima na glória.",
                    },
                ],
            },
            {
                id: "comentario-d",
                letra: "D",
                titulo: "Símbolo da Salvação: a Cruz",
                blocos: [
                    {
                        tipo: "p",
                        texto: "O símbolo da salvação é a “CRUZ”. Ela está vazia porque Cristo vive ([[I Cor 1:18-20]]).",
                    },
                ],
            },
            {
                id: "comentario-e",
                letra: "E",
                titulo: "Cor simbólica: Escarlate",
                blocos: [
                    {
                        tipo: "p",
                        texto: "A doutrina da Salvação está simbolizada na bandeira da Igreja do Evangelho Quadrangular pela cor escarlate, representando o “SANGUE DE CRISTO DERRAMADO POR NÓS”.",
                    },
                ],
            },
        ],

        porQueVerboSeFezCarneTitulo: "Por que o Verbo se fez carne?",
        porQueVerboSeFezCarne: [
            {
                n: "01",
                texto: "Para ter um corpo a ser oferecido como sacrifício pelo pecado dos homens: “...santificados pela oblação do corpo de Jesus Cristo...” ([[Heb 10:10]]).",
            },
            {
                n: "02",
                texto: "Para que Seu Sangue pudesse ser uma expiação sobre o altar (a cruz), pois “é o sangue que faz expiação pela alma” ([[Lev 17:11]]).",
            },
            {
                n: "03",
                texto: "Para que se tornasse o perfeito Cordeiro do Sacrifício ([[João 1:29]]; [[Isa 53:7]]; [[I Pe 1:18,19]]).",
            },
            {
                n: "04",
                texto: "Para que Deus pudesse manifestar a expressão máxima do Seu amor para com o mundo ([[João 3:16]]).",
            },
        ],

        aspectosHumanosTitulo: "Aspectos humanos de Jesus que a Escritura focaliza",
        aspectosHumanos: [
            {
                n: "01",
                texto: "É “a semente da mulher” ([[Gen 3:15]]).",
            },
            {
                n: "02",
                texto: "É “o homem de dores e trabalhos” ([[Isa 53:3]]).",
            },
            {
                n: "03",
                texto: "Chamou-se a si mesmo o “Filho do Homem” ([[Mat 9:6]]).",
            },
            {
                n: "04",
                texto: "Teve fome ([[Lucas 4:2]]), teve sede ([[João 19:28]]), cansou-se ([[João 4:6]]), foi tentado ([[Heb 4:15]]), sentiu agonia ([[João 11:35]]), sentiu dor ([[Mar 8:31]]), sentiu pesar ([[Mat 26:38]]).",
            },
            {
                n: "05",
                texto: "“A si mesmo se esvaziou, assumindo a forma de servo, tornando-se em semelhança de homem” ([[Fil 2:7,8]] – Ed. Atualizada).",
            },
            {
                n: "06",
                texto: "Sofreu como homem: foi cuspido, flagelado, ridicularizado, desdenhado, rejeitado, humilhado e morto. “Certamente levou as nossas enfermidades e carregou as nossas dores” ([[Isa 53:4]]).",
            },
        ],
        aspectosFecho:
            "O “FILHO DO HOMEM” ressuscitou ao terceiro dia ([[I Cor 15:4]]), foi visto por muitos ([[I Cor 15:4-8]]), subiu ao céu ([[Atos 1:9]]) e está à mão direita de Deus Pai ([[Heb 1:1,3]]).",

        simbolos: [
            {
                id: "simbolo-cruz",
                tipo: "cruz",
                titulo: "CRUZ",
                subtitulo: "O Símbolo da Salvação",
                texto: "O símbolo da salvação é a “CRUZ”. Ela está vazia porque Cristo vive",
                ref: "I Cor 1:18-20",
            },
            {
                id: "simbolo-escarlate",
                tipo: "escarlate",
                titulo: "ESCARLATE",
                subtitulo: "A cor na bandeira da Igreja",
                texto: "A doutrina da Salvação está simbolizada na bandeira da Igreja do Evangelho Quadrangular pela cor escarlate, representando o",
                destaque: "SANGUE DE CRISTO DERRAMADO POR NÓS",
            },
        ],
    },
];

export function getEstudoById(id) {
    return ESTUDOS.find((e) => e.id === id) || null;
}
