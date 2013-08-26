function parse_fighters(fighter_definitions, fighters) {
    var new_char, i, total = fighter_definitions.length, gen_attr, ai_attr;
    for (i = 0; i < total; i++) {
        new_char = fighter_definitions[i];
        gen_attr = [false];
        gen_attr = gen_attr.concat(new_char.slice(1,10));
        ai_attr = new_char.slice(10,16);
        gen_attr.push({
                        initiative: ai_attr[0],
                        high_low: ai_attr[1],
                        reactiveness: ai_attr[2],
                        agro: ai_attr[3],
                        defense: ai_attr[4],
                        berserk: ai_attr[5],
                    });
        console.log(gen_attr);
        console.log(construct(Fighter, gen_attr));
        fighters[i] = {fighter: construct(Fighter, gen_attr), name: new_char[0], desc: new_char[16]}
    }

}