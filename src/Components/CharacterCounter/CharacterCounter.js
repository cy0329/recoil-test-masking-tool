import {useRecoilState} from "recoil";
import TextInput from "../TextInput/TextInput";
import CharacterCount from "./CharactorCount";

function CharacterCounter() {
  return (
    <div>
      <TextInput />
      <CharacterCount />
    </div>
  );
}



export default CharacterCounter