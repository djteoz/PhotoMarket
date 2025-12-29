import { AddStudioForm } from "@/components/studios/add-studio-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AddStudioPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Добавить новую студию</CardTitle>
            <CardDescription>
              Заполните информацию о вашей студии, чтобы начать принимать
              бронирования.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddStudioForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
