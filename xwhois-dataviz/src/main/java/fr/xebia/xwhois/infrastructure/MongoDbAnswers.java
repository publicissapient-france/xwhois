package fr.xebia.xwhois.infrastructure;

import com.mongodb.MongoClient;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import fr.xebia.xwhois.model.Answer;
import fr.xebia.xwhois.model.inbound.Answers;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;

import static com.mongodb.MongoCredential.createCredential;
import static java.util.Collections.singletonList;

public class MongoDbAnswers implements Answers {

    private final String host;
    private final String user;
    private final String password;

    public MongoDbAnswers(String host, String user, String password) {
        this.host = host;
        this.user = user;
        this.password = password;
    }

    @Override
    public List<Answer> get() {
        List<Answer> answers = new ArrayList<>();
        try (MongoClient mongoClient = new MongoClient(
            new ServerAddress(host),
            singletonList(createCredential(user, "xwhois", Optional.ofNullable(password).orElse("").toCharArray()))
        )) {
            MongoDatabase database = mongoClient.getDatabase("xwhois");
            MongoCollection<Document> challenges = database.getCollection("challenges");
            challenges.find().map(document -> new Answer(
                document.getString("playerName"),
                document.getString("challengeName"),
                new Integer(1).equals(document.getInteger("score")),
                document.getDate("date").toInstant()
            )).forEach((Consumer<? super Answer>) answers::add);
        }
        return answers;
    }

}
