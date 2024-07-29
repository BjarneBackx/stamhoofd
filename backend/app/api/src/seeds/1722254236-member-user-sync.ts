import { Migration } from '@simonbackx/simple-database';
import { Member } from '@stamhoofd/models';
import { MemberUserSyncer } from '../helpers/MemberUserSyncer';

export default new Migration(async () => {
    if (STAMHOOFD.environment == "test") {
        console.log("skipped in tests")
        return;
    }
    process.stdout.write('\n');
    let c = 0;
    let id: string = '';
    
    while(true) {
        const rawMembers = await Member.where({
            id: {
                value: id,
                sign: '>'
            }
        }, {limit: 100, sort: ['id']});

        const members = await Member.getBlobByIds(...rawMembers.map(m => m.id));

        for (const member of members) {
            await MemberUserSyncer.onChangeMember(member);

            c++;

            if (c%1000 === 0) {
                process.stdout.write('.');
            }
            if (c%10000 === 0) {
                process.stdout.write('\n');
            }
        }

        id = members[members.length - 1].id;

        if (members.length === 0) {
            break;
        }
    }

    // Do something here
    return Promise.resolve()
});


