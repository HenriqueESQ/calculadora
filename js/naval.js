function fmt(value, digits = 2) {
    return Number(value).toFixed(digits).replace(".", ",");
}

function calcularNaval(largura, altura) {
    const painelL = 1.2;
    const painelA = 2.1;
    const barra = 3.0;
    const perda = 1.1;

    const paineisHorizontal = Math.ceil(largura / painelL);
    const paineisVertical = Math.ceil(altura / painelA);
    const paineis = Math.ceil(paineisHorizontal * paineisVertical * perda);

    const totalGuiasMl = (2 * largura) + (2 * altura);
    const guias = Math.ceil((totalGuiasMl / barra) * 1.05);

    const linhasTravessa = Math.max(1, Math.ceil(altura / 1.2) - 1);
    const totalTravessaMl = linhasTravessa * largura;
    const travessas = Math.ceil((totalTravessaMl / barra) * perda);
    const brutoPaineis = paineisHorizontal * paineisVertical * perda;
    const brutoGuias = (totalGuiasMl / barra) * 1.05;
    const brutoTravessas = (totalTravessaMl / barra) * perda;
    const conferencias = [
        `Painéis na largura: ${fmt(largura)} / ${fmt(painelL)} = ${fmt(largura / painelL)} -> arredonda para cima = ${paineisHorizontal}`,
        `Painéis na altura: ${fmt(altura)} / ${fmt(painelA)} = ${fmt(altura / painelA)} -> arredonda para cima = ${paineisVertical}`,
        `Painéis total: ${paineisHorizontal} x ${paineisVertical} x ${fmt(perda)} = ${fmt(brutoPaineis)} -> arredonda para cima = ${paineis}`,
        `Guias: ((${fmt(largura)} x 2) + (${fmt(altura)} x 2)) / ${fmt(barra, 0)} x 1,05 = ${fmt(brutoGuias)} -> arredonda para cima = ${guias}`,
        `Travessas: ((${linhasTravessa} x ${fmt(largura)}) / ${fmt(barra, 0)}) x ${fmt(perda)} = ${fmt(brutoTravessas)} -> arredonda para cima = ${travessas}`
    ];

    return {
        paineis,
        guias,
        travessas,
        conferencias
    };
}