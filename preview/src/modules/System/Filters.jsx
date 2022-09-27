import { Button } from "../../components/Button"
import { FormItem } from "../../components/FormItem"
import { Input } from "../../components/Input"
import { useModel } from "@setsuna/setsuna-use"
import { useEffect } from "@setsuna/setsuna"
import { CButton } from "../../components/CButton"

export function Filters() {
  const [title, bindTitle, setTitle] = useModel("title")
  const [des, bindDes, setDes] = useModel("des")
  const [icon, bindIcon, setIcon] = useModel("icon")
  const [author, bindAuthor, setAuthor] = useModel("author")

  const onSearch = () => {
    const formState = {
      title: title(),
      des: des(),
      icon: icon(),
      author: author()
    }
    console.log( formState )
  }
  const onReset = () => {
    setTitle("title")
    setDes("des")
    setIcon("icon")
    setAuthor("author")
  }

  return () => (
    <div class="filters flex flex-wrap gap-4">
      <FormItem label="title">
        <Input {...bindTitle} />
      </FormItem>

      <FormItem label="des">
        <Input {...bindDes} />
      </FormItem>

      <FormItem label="icon">
        <Input {...bindIcon} />
      </FormItem>

      <FormItem label="author">
        <Input {...bindAuthor} />
      </FormItem>

      <FormItem label=" ">
        <Button css="mr-2" onClick={onSearch}>search</Button>
        <Button css="text-purple-500 bg-white hover:text-white" onClick={onReset}>reset</Button>
        <CButton></CButton>
      </FormItem>
    </div>
  )
}
